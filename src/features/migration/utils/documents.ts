import type { MigratedDocument, MigrationDocumentType } from '../types';
import { humaniseCode } from './format';

export const documentTypeKey = (category: string, subCategory?: string | null) => `${category}|${subCategory ?? ''}`;

export interface DocumentGroup {
  key: string;
  label: string;
  documents: MigratedDocument[];
}

/** Groups documents under the label of their document type, in the order the API lists the types. */
export const groupDocuments = (documents: MigratedDocument[], documentTypes: MigrationDocumentType[]): DocumentGroup[] => {
  const labels = new Map<string, string>();
  documentTypes.forEach((type) => {
    labels.set(documentTypeKey(type.category, type.subCategory), type.label);
    if (!labels.has(documentTypeKey(type.category))) labels.set(documentTypeKey(type.category), type.label);
  });
  const order = documentTypes.map((type) => documentTypeKey(type.category, type.subCategory));
  const groups = new Map<string, DocumentGroup>();
  documents.forEach((document) => {
    const exactKey = documentTypeKey(document.category, document.subCategory);
    const key = labels.has(exactKey) ? exactKey : documentTypeKey(document.category);
    const label = labels.get(key) ?? humaniseCode(document.category || 'Other');
    const group = groups.get(key) ?? { key, label, documents: [] };
    group.documents.push(document);
    groups.set(key, group);
  });
  const rank = (key: string) => {
    const index = order.indexOf(key);
    return index === -1 ? order.length : index;
  };
  return [...groups.values()].sort((a, b) => rank(a.key) - rank(b.key));
};
