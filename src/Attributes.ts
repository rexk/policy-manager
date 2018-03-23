export interface IAttributes {
  get(key: string): any;
  keys(): string[];
  merge(viewer: IAttributes): IAttributes;
}

export function fromMap(map: Map<string, any>): IAttributes {
  const values = new Map(map);
  return {
    get(key: string) {
      return values.get(key);
    },
    keys(): string[] {
      return Array.from(values.keys());
    },
    merge(viewer: IAttributes): IAttributes {
      const result = new Map(values);
      viewer.keys().forEach(key => {
        result.set(key, viewer.get(key));
      });
      return fromMap(result);
    },
  };
}

export function fromObject(obj: Object): IAttributes {
  const map = new Map<string, any>();
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    map.set(val, val);
  });
  return fromMap(map);
}
