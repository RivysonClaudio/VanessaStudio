export interface IProcedureEntityProps{
    id: string;
    category: string,
    description: string,
    due_date: number,
    ammount: number
}

export class ProcedureEntity{
    private props: IProcedureEntityProps;

    constructor(props: IProcedureEntityProps){
        this.props = props;
    }

    get id(): string {
        return this.props.id;
    }
    set id(id: string) {
        this.props.id = id;
    }

    get category(): string {
        return this.props.category;
    }
    set category(category: string) {
        this.props.category = category;
    }

    get description(): string {
        return this.props.description;
    }
    set description(description: string) {
        this.props.description = description;
    }

    get due_date(): number {
        return this.props.due_date;
    }
    set due_date(due_date: number) {
        this.props.due_date = due_date;
    }

    get ammount(): number {
        return this.props.ammount;
    }
    set ammount(ammount: number) {
        this.props.ammount = ammount;
    }
}