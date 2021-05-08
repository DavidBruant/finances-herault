//@ts-check

import {readFileSync} from 'fs'
import {mkdir, readFile, writeFile, readdir} from 'fs/promises';
import {join, dirname} from 'path';
import { fileURLToPath } from 'url';

import {DOMParser} from 'xmldom';

import getPlansDeCompte from './shared/getPlansDeCompte.js'

import xmlDocumentToDocumentBudgetaire from '../src/shared/js/finance/xmlDocumentToDocumentBudgetaire.js';
import makeAggregateFunction from '../src/shared/js/finance/makeAggregateFunction.js'
import csvStringToCorrections from '../src/shared/js/finance/csvStringToCorrections.js';
import {fromXMLDocument} from '../src/shared/js/finance/planDeCompte.js'

const __dirname = dirname(fileURLToPath(import.meta.url));

// @ts-ignore
const aggregationDescription = JSON.parse(readFileSync(new URL('../data/finances/description-agrégation.json', import.meta.url)));

const corrections = csvStringToCorrections(readFileSync(join(__dirname, '../data/finances/corrections-agregation.csv'), {encoding: 'utf-8'}))

const BUILD_FINANCE_DIR = './build/finances';
export const SOURCE_FINANCE_DIR = './data/finances';

const plansDeComptesP = getPlansDeCompte(join(SOURCE_FINANCE_DIR, 'plansDeCompte'))
.then(pdcs => pdcs.map(fromXMLDocument))


mkdir(BUILD_FINANCE_DIR)
.catch(err => {
    if(err.code === 'EEXIST'){
        return; // ignore
    }

    throw err;
})
.then( () => {
    return readdir(join(SOURCE_FINANCE_DIR, 'CA'))
    .then(files => {
        return Promise.all(files.map(f => {
            return readFile(join(SOURCE_FINANCE_DIR, 'CA', f), {encoding: 'utf-8'})
            .then( str => (new DOMParser()).parseFromString(str, "text/xml") )
            .then(xmlDocumentToDocumentBudgetaire)
        }))
    })
})
.then( documentBudgetaires => {
    return plansDeComptesP.then(plansDeCompte => {
        const ret = {
            documentBudgetaires : documentBudgetaires.map(db => {
                return Object.assign({}, db, {rows: [...db.rows]})
            }),
            aggregations: documentBudgetaires.map(docBudg => {
                const year = docBudg['Exer']
                const planDeCompte = plansDeCompte.find(pdc => pdc.Exer === year)

                return {
                    year,
                    aggregation: makeAggregateFunction(aggregationDescription, planDeCompte)(docBudg, corrections)
                }
            })
        }
        return ret;
    })
    
})
.then(data => {
    return writeFile(join(BUILD_FINANCE_DIR, 'finance-data.json'), JSON.stringify(data), 'utf-8')
})
.catch(err => {
    console.error('err', err);
})
