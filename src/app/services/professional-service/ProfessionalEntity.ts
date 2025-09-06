export interface IProfessionalEntityProps{
    id: string;
    createdAt: string;
    name: string;
    phones: string[];
    pass_through: number
}

export class ProfessionalEntity{
    private props: IProfessionalEntityProps;

    constructor(props: IProfessionalEntityProps){
        this.props = props;
    }

    get id(): string {
        return this.props.id;
    }
    set id(id: string) {
        this.props.id = id;
    }

    get createdAt(): string {
        return this.props.createdAt;
    }
    set createdAt(createdAt: string) {
        this.props.createdAt = createdAt;
    }

    get name(): string {
        return this.props.name;
    }
    set name(name: string) {
        this.props.name = name;
    }

    get phones(): string[] {
        return this.props.phones;
    }
    set phones(phones: string[]) {
        this.props.phones = phones;
    }

    get pass_through(): number {
        return this.props.pass_through;
    }
    set pass_through(pass_through: number) {
        this.props.pass_through = pass_through;
    }
}