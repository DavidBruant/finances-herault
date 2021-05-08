//@ts-check
import {DOMParser} from 'xmldom';
// @ts-ignore
import _querySelectorAll from "query-selector";

// @ts-ignore
const querySelectorAll = _querySelectorAll.default;

const V = 'V';

const DocumentPrototype = Object.getPrototypeOf( new DOMParser().parseFromString("<x/>", "text/xml") );

DocumentPrototype.querySelectorAll = function(/** @type {string} */ selector) {
    return querySelectorAll(selector, this);
};
DocumentPrototype.querySelector = function(/** @type {string} */ selector) {
    return querySelectorAll(selector, this)[0];
};

const baseDocumentBudgetaireXML = `<?xml version="1.0" encoding="UTF-8"?>
<DocumentBudgetaire xsi:schemaLocation="http://www.minefi.gouv.fr/cp/demat/docbudgetaire Actes_budgetaires___Schema_Annexes_Bull_V15\DocumentBudgetaire.xsd" xmlns="http://www.minefi.gouv.fr/cp/demat/docbudgetaire" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <VersionSchema V=""/>
    <EnTeteDocBudgetaire>
        <DteStr V=""/>
        <LibelleColl V=""/>
        <IdColl V=""/>
    </EnTeteDocBudgetaire>
    <Budget>
        <EnTeteBudget>
            <Nomenclature V=""/>
        </EnTeteBudget>
        <BlocBudget>
            <NatDec V=""/>
            <Exer V=""/>
            <NatFonc V=""/>
        </BlocBudget>
        <InformationsGenerales/>
    </Budget>
</DocumentBudgetaire>`

/**
 * 
 * @param {{
 *    lignesBudget: {
 *      Nature: string, 
 *      Fonction: string, 
 *      MtReal: number, 
 *      CodRD: 'R' | 'D',
 *      OpBudg: '0'
 *    }[], 
 *    Exer: number, 
 *    Nomenclature: 'M52-M52', 
 *    NatDec: '01' | '02' | '03' | '09', 
 *    NatFonc: '1' | '2' | '3', 
 *    LibelleColl: string,
 *    IdColl: string,
 *    VersionSchema: string
 * }} data
 */
export default function makeDocBudg({lignesBudget, Exer, Nomenclature, NatDec, NatFonc, LibelleColl, IdColl, VersionSchema}) {
    const doc = (new DOMParser()).parseFromString(baseDocumentBudgetaireXML, "text/xml");

    const VersionSchemaElement = /** @type {Element} */ doc.querySelector('VersionSchema');
    // @ts-ignore
    VersionSchemaElement.setAttribute(V, VersionSchema)

    const LibelleCollElement = doc.querySelector('EnTeteDocBudgetaire LibelleColl');
    // @ts-ignore
    LibelleCollElement.setAttribute(V, LibelleColl)

    const IdCollElement = doc.querySelector('EnTeteDocBudgetaire IdColl');
    // @ts-ignore
    IdCollElement.setAttribute(V, IdColl)

    const NatFoncElement = doc.querySelector('Budget BlocBudget NatFonc');
    // @ts-ignore
    NatFoncElement.setAttribute(V, NatFonc)

    const NatDecElement = doc.querySelector('Budget BlocBudget NatDec');
    // @ts-ignore
    NatDecElement.setAttribute(V, NatDec)

    const NomenclatureElement = doc.querySelector('Budget EnTeteBudget Nomenclature');
    // @ts-ignore
    NomenclatureElement.setAttribute(V, Nomenclature)

    const ExerElement = doc.querySelector('Budget BlocBudget Exer');
    // @ts-ignore
    ExerElement.setAttribute(V, Exer.toString())

    const BudgetElement = doc.querySelector('Budget');

    for(const {Nature, Fonction, MtReal, CodRD, OpBudg} of lignesBudget){
        const ligneBudgetElement = doc.createElement('LigneBudget')
        
        const NatureEl = doc.createElement('Nature')
        NatureEl.setAttribute(V, Nature)
        ligneBudgetElement.appendChild(NatureEl)
        
        const FonctionEl = doc.createElement('Fonction')
        FonctionEl.setAttribute(V, Fonction)
        ligneBudgetElement.appendChild(FonctionEl)
        
        const MtRealEl = doc.createElement('MtReal')
        MtRealEl.setAttribute(V, MtReal.toString())
        ligneBudgetElement.appendChild(MtRealEl)
        
        const CodRDEl = doc.createElement('CodRD')
        CodRDEl.setAttribute(V, CodRD)
        ligneBudgetElement.appendChild(CodRDEl)
        
        const OpBudgEl = doc.createElement('OpBudg')
        OpBudgEl.setAttribute(V, OpBudg)
        ligneBudgetElement.appendChild(OpBudgEl)

        // @ts-ignore
        BudgetElement.appendChild(ligneBudgetElement)
    }

    return doc
}