//@ts-check

import {join} from 'path';
import {writeFileSync} from 'fs';
import {readFile} from 'fs/promises';

import {csvParse} from 'd3-dsv';
import { XMLSerializer } from 'xmldom'

import {SOURCE_FINANCE_DIR} from './make-finance-data.js'
import makeDocBudg from './shared/makeDocBudg.js'

/**
 * @param {string} montantStr
 * @returns {number}
 */
function parseMontant(montantStr){
    return Number(montantStr.replace(/\s/g, '').replace('€', '').replace(',', '.'))
}

/**
 * @param {import("d3-dsv").DSVParsedArray<object> | { Nature: string; Fonction: string; Montant?: string | undefined; }[]} data
 * @param {string} CodRD
 * @returns {{
 *      Nature: string, 
 *      Fonction: string, 
 *      MtReal: number, 
 *      CodRD: 'R' | 'D',
 *      OpBudg: '0'
 * }[]}
 */
function csvDataToDocumentBudgetaireData(data, CodRD){
    return data
        // @ts-ignore
        .map(({Nature, Fonction, Montant = ''}) => (
            { Nature, Fonction,  CodRD, MtReal: parseMontant(Montant), OpBudg: '0'}
        ))
        .filter(({ Nature, Fonction, MtReal }) => Nature && Fonction && Number.isFinite(MtReal) && MtReal !== 0)
}

const DPs = Promise.all(['DF.csv', 'DI.csv'].map(f => {
    return readFile(join(SOURCE_FINANCE_DIR, 'csv', f), {encoding: 'utf-8'})
    // @ts-ignore
    .then(csvParse)
    .then(data => csvDataToDocumentBudgetaireData(data, 'D'))
}))

const RPs = Promise.all(['RF.csv', 'RI.csv'].map(f => {
    return readFile(join(SOURCE_FINANCE_DIR, 'csv', f), {encoding: 'utf-8'})
    // @ts-ignore
    .then(csvParse)
    .then(data => csvDataToDocumentBudgetaireData(data, 'R'))
}))

const lignesBudget = await Promise.all([DPs, RPs])
.then(lignes => lignes.flat(2))

const LibelleColl = 'CD34';
const Exer = 2019;

const doc = makeDocBudg({
    lignesBudget,
    Exer,
    Nomenclature: 'M52-M52', 
    NatDec: '09', 
    NatFonc: '3', 
    LibelleColl,
    IdColl: LibelleColl,
    VersionSchema: '81'
})

const str = (new XMLSerializer()).serializeToString(doc)

writeFileSync(join(SOURCE_FINANCE_DIR, 'CA', `${LibelleColl}-${Exer}.xml`), str, {encoding: 'utf-8'})