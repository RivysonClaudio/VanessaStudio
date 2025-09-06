export interface IClientEntityProps{
    id: string;
    name: string;
    nickname: string;
    photo: string;
    birth: string;
    phones: string[];
    adress:{
        zip_code: string;
        street: string;
        complement: string;
        hood: string;
        city: string;
        state: string;
    }
    createdAt: string;
}

export class ClientEntity{
    private props: IClientEntityProps;

    constructor(props: IClientEntityProps){
        this.props = props;
    }

    get id(): string{ return this.props.id; }

    get name(): string { return this.props.name; }

    get phones(): string[] { return this.props.phones; }
}