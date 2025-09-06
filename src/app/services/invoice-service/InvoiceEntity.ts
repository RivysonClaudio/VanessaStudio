export interface IInvoiceProcedureProps{
    id: string | null,
    date: string | null,
    status: string,
    category: string,
    description: string,
    ammount: number,
    due_date: number,
    professional_id: string,
    professional_name: string
}

export interface IInvoiceEntityProps{
        id: string | null,
		date: string,
		number: number,
		status: string,
		ammount: number,
		client_id: string,
		client_name: string,
		client_phone: string,
		more_info: string,
		procedures: IInvoiceProcedureProps[]
}

export class InvoiceEntity{
    private props: IInvoiceEntityProps;

    constructor(props: IInvoiceEntityProps){
        this.props = props;
    }

    get id(): string | null {
        return this.props.id;
    }
    set id(id: string | null) {
        this.props.id = id;
    }

    get date(): string{
        return this.props.date;
    }

    set date(date: string){
        this.props.date = date;
    }

    get number(): number {
        return this.props.number;
    }
    set number(number: number) {
        this.props.number = number;
    }

    get status(): string {
        return this.props.status;
    }
    set status(status: string) {
        this.props.status = status;
    }
    update_status(): void{
        const status_list = new Map();

        status_list.set("AGENDADA", 0);
        status_list.set("FINALIZADA", 0);
        status_list.set("CANCELADA", 0);

        this.props.procedures.forEach(p => { status_list.set(p.status, status_list.get(p.status) + 1) });

        if(status_list.get("AGENDADA") === 0 && status_list.get("FINALIZADA") === 0) this.props.status = "CANCELADA";
        if(status_list.get("AGENDADA") === 0 && status_list.get("FINALIZADA") !== 0) this.props.status = "FINALIZADA";

        if(status_list.get("AGENDADA") !== 0) this.props.status = "AGENDADA";
    }

    get ammount(): number {
        return this.props.ammount;
    }
    set ammount(ammount: number) {
        this.props.ammount = ammount;
    }

    get client_id(): string {
        return this.props.client_id;
    }
    set client_id(client_id: string) {
        this.props.client_id = client_id;
    }

    get client_name(): string {
        return this.props.client_name;
    }
    set client_name(client_name: string) {
        this.props.client_name = client_name;
    }

    get client_phone(): string {
        return this.props.client_phone;
    }
    set client_phone(client_phone: string) {
        this.props.client_phone = client_phone;
    }

    get more_info(): string {
        return this.props.more_info;
    }
    set more_info(more_info: string) {
        this.props.more_info = more_info;
    }

    get procedures(): IInvoiceProcedureProps[] {
        return this.props.procedures;
    }
    set procedures(procedure_props: IInvoiceProcedureProps){
        this.props.procedures.push(procedure_props);
    }
    delete_procedure(procedure_id: string): void{
        const procedure = this.props.procedures.find(p => p.id === procedure_id);

        if(procedure){
            this.props.ammount -= procedure.ammount;
            this.props.procedures = this.props.procedures.filter(p => p.id !== procedure.id);
        }
    }
    update_procedure_status(procedure_id: string, status: string): void{
        const procedure = this.props.procedures.find(p => p.id === procedure_id);
        if(procedure) procedure.status = status;
    }

}