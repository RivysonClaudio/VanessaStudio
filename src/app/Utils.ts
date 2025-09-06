export class Utils{
    uuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    phoneNumberFormatter(phone: string): string{

        if(typeof(phone) != "string"){
            return "";
        }

        const onlyNumber = phone.replace(/\D+/g, '');

        if(onlyNumber.length != 11){
            return "";
        }

        const phoneFormatted = `(${onlyNumber.slice(0, 2)}) ${onlyNumber.slice(2, 7)}-${onlyNumber.slice(7, 11)}`;

        return phoneFormatted;
    }

    currencyFormatter(value: string): string{
        const mask = "##.###.###.##0,00";

        let onlynumbers: string = value.replace(/\D/g, '');

        if (!onlynumbers || isNaN(Number(onlynumbers))) {
        return "R$ 0,00";
        }

        onlynumbers = Number.parseInt(onlynumbers).toString();
        let valueLength = onlynumbers.length;
        let maskedValue = "";
        
        for(let i = mask.length; i > 0; i--){
            if(mask[i - 1] === "#" && valueLength === 0){
            break;
            }else if(mask[i - 1] === "#" && valueLength != 0){
            maskedValue = onlynumbers[--valueLength] + maskedValue;
            }else if(mask[i - 1] === "0" && valueLength != 0){
            maskedValue = onlynumbers[--valueLength] + maskedValue;
            }else{
            maskedValue = mask[i - 1] + maskedValue;
            }
        }
        
        if(isNaN(Number.parseInt(maskedValue[0]))){maskedValue = maskedValue.substring(1)}

        return "R$ " + maskedValue;
    }
}