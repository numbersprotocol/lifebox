export class DataField {
    name: string;
    icon: string;
    type: DataFieldType;
    value: string | number | boolean;
    unit: string;
    constructor(icon: string,name: string, type: DataFieldType, defaultValue?: string | number | boolean, unit?: string) {
        this.icon = icon;

        this.name = name;
        this.type = type;
        this.value = (defaultValue) ? defaultValue : null;
        this.unit = (unit) ? unit : null;
    }

    getValue() {
        return this.value;
    }

    setValue(value: string | number | boolean) {
        this.value = value;
    }
}

export enum DataFieldType {
    String,
    Number,
    Boolean,
}
