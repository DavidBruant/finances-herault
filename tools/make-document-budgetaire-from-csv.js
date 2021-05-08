//@ts-check

import {join} from 'path';
import {writeFileSync} from 'fs';
import {readFile} from 'fs/promises';

import {sum} from 'd3-array'
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

const LeftOverFNature = '0000'
const LeftOverINature = '9999'

/**
 * @param {import("d3-dsv").DSVParsedArray<object> | {Nature: string;Fonction: string;Montant?: string | undefined;}[]} data
 * @param {'R' | 'D'} CodRD
 * @param {number} expectedTotal
 * @param {'F' | 'I'} FI
 * @returns {{
    Nature: string;
    Fonction: string;
    MtReal: number;
    CodRD: 'R' | 'D';
    OpBudg: '0';
}[]}
 */
function csvDataToLigneBudgetData(data, CodRD, FI, expectedTotal){
    const lignesBudgetData = data
        // @ts-ignore
        .map(({Nature, Fonction, Montant = ''}) => (
            { Nature, Fonction,  CodRD, MtReal: parseMontant(Montant), OpBudg: '0'}
        ))
        .filter(({ Nature, Fonction, MtReal }) => Nature && Fonction && Number.isFinite(MtReal) && MtReal !== 0);

    const currentTotal = sum(lignesBudgetData.map(({MtReal}) => MtReal));

    console.log('expectedTotal', CodRD, FI, expectedTotal)

    lignesBudgetData.push({ 
        Nature: FI === 'F' ? LeftOverFNature : LeftOverINature,
        Fonction: '01',  
        CodRD, 
        MtReal: expectedTotal - currentTotal,
        OpBudg: '0'
    })

    return lignesBudgetData;
}

const TotalSectionColumnName = 'Total PDF'

const totalsP = readFile(join(SOURCE_FINANCE_DIR, 'csv', 'infos.csv'), {encoding: 'utf-8'})
// @ts-ignore
.then(csvParse)
.then((/** @type {any} */ infos) => {
    // @ts-ignore
    const DF = parseMontant(infos.find(({Section}) => Section === 'Dépenses de fonctionnement')[TotalSectionColumnName]);
    // @ts-ignore
    const DI = parseMontant(infos.find(({Section}) => Section === `Dépenses d'investissement`)[TotalSectionColumnName]);
    // @ts-ignore
    const RF = parseMontant(infos.find(({Section}) => Section === `Recettes de fonctionnement`)[TotalSectionColumnName]);
    // @ts-ignore
    const RI = parseMontant(infos.find(({Section}) => Section === `Recettes d'investissement`)[TotalSectionColumnName]);

    return { DF, RF, RI, DI }
})

const ligneBudgetBySectionPs = ['RF', 'RI', 'DF', 'DI'].map(section => {
    const filename = `${section}.csv`;
    return readFile(join(SOURCE_FINANCE_DIR, 'csv', filename), {encoding: 'utf-8'})
    // @ts-ignore
    .then(csvParse)
    .then(async data => {
        const totals = await totalsP;

        return {
            section, 
            // @ts-ignore
            lignesBudget: csvDataToLigneBudgetData(data, section[0], section[1], totals[section])
        }
    })
})


const lignesBudget = await Promise.all(ligneBudgetBySectionPs)
.then(ligneBudgetBySection => ligneBudgetBySection.map(({lignesBudget}) => lignesBudget).flat(1))


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