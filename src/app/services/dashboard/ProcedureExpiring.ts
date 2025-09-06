export interface IProcedureExpiringProps{
    id: string,
    client_id: string,
    client_name: string,
    client_phone: string,
    invoice_id: string,
    invoice_number: number,
    invoice_date: string,
    procedure_id: string,
    procedure_desc: string,
    procedure_date: string,
    procedure_expires: string,
    procedure_ammount: number,
    professional_id: string,
    professional_name: string
}

export class ProcedureExpiringEntity{
    private props: IProcedureExpiringProps;

    constructor(props: IProcedureExpiringProps){
        this.props = props;
    }
}