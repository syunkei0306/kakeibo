import CustomElement from "../component/CustomElement.ts";

/**
 * DOM クラスで実装された getter のうち、HTMLElement を返すものすべての値を配列で取得
 * @param {object} domObject DOM
 * @returns {*} HTMLElement の配列
 */
export const domElementList = (domObject: object): HTMLElement[] => {
  const descriptors = Object.getOwnPropertyDescriptors(domObject);
  return Object.getOwnPropertyNames(descriptors)
    .map((name) => descriptors[name])
    .filter((prop) => prop.get !== undefined)
    .map((prop) => prop.get?.call(domObject)) // getter を呼び出し
    .filter((val) => val instanceof HTMLElement); // HTMLElement のみにフィルタ
};

/**
 * DOM クラスで実装された getter のうち、CustomElement を返すものすべての値を配列で取得
 * @param domObject
 */
export const customElementList = (domObject: object): CustomElement[] => {
  return domElementList(domObject).filter((elem) => elem instanceof CustomElement);
};
