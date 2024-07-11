
import moment from 'moment';
import ExcelJS from 'exceljs';

export const COLUMN_KEYS = {
    "employeeId": "Employee ID",
    "firstName": "First Name",
    "lastName": "Last Name",
    "completeName": "Complete Name",
    "fathersName": "Fathers Name",
    "gender": "Gender",
    "designation": "Designation",
    "dateOfBirth": "Date of Birth",
    "dateOfJoining": "Date of Joining",
    "kamelpayOrOtherBank": "Kamelpay or Other bank",
    "wpsEstablishmentId": "WPS Establishment ID",
    "iban": "IBAN",
    "bankName": "Bank Name",
    "wpsPersonId": "WPS Person ID",
    "passportNumber": "Passport Number",
    "passportExpiryDate": "Passport Expiry Date",
    "nationality": "Nationality",
    "laborCard": "Labor card",
    "emiratesId": "Emirates ID",
    "emiratesIdExpiryDate": "Emirates ID expiry date"
}

export const REQ_COLUMN_KEYS = {
    "firstName" :  "First Name",
    "lastName" : "Last Name",
    "completeName" :  "Complete Name",
    "fathersName": "Fathers Name",
    "gender":  "Gender", 
    "dateOfBirth": "Date of Birth",
    "kamelpayOrOtherBank": "Kamelpay or Other bank",
    "passportNumber":  "Passport Number",
    "passportExpiryDate": "Passport Expiry Date",
    "nationality":   "Nationality"
};

export const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
}

export const extracDateInMol = (mol) => {
    if(mol){
        const DOB = mol.toString()?.substring(3, 9); // Extracts characters from index 2 to 7 (6 digits)
        if (new Date(moment(DOB, 'DDMMYY')) > new Date()) {
           return moment(DOB, 'DDMMYY').subtract(100, 'years').format('MM/DD/YYYY')
        } else {
            return moment(DOB, 'DDMMYY').format('MM/DD/YYYY')
        }
    }
};

export const convertDaysIntoDate = (days) => {
    if(days){
        // Convert DOB to milliseconds since Unix epoch
        const timestamp = (days - (25567 + 2)) * 86400 * 1000;

        // Create Moment object from timestamp
        const momentDate = moment(timestamp);

        // Format the resultDate as needed
        return momentDate.format('MM/DD/YYYY')
    }
}

export const checkDateOfBirth = (mol, dateOfBirth) => {
    const getDateOfBirthIntoMol = extracDateInMol(mol)
    const getActulDateOfBirth = convertDaysIntoDate(dateOfBirth)
    
console.log("checkDateOfBirth", getDateOfBirthIntoMol, getActulDateOfBirth)

    let type = "";
    let text = ""

    if(dateOfBirth && mol) {
        const isSame = moment(getDateOfBirthIntoMol).isSame(moment(getActulDateOfBirth))
        if(isSame){
            // console.log('checkDateOfBirth', getDateOfBirthIntoMol, getActulDateOfBirth, isSame, "PASS", "same dates")
            text = getActulDateOfBirth;
            type = "PASS"
        } else {
            text = getActulDateOfBirth;
            // console.log('checkDateOfBirth', getDateOfBirthIntoMol, getActulDateOfBirth, isSame, "FAIL", "not same dates")
            type = "FAIL"
        }

    } else if(dateOfBirth && !mol) {
        const getAge = calculateAge(getActulDateOfBirth)
        if(getAge >= 18){
            text = getActulDateOfBirth;
            type = "PASS"
            // console.log("checkDateOfBirth", getActulDateOfBirth, getAge, "PASS", "18+")
        } else {
            text = getActulDateOfBirth;
            // console.log("checkDateOfBirth", getActulDateOfBirth, getAge, "FAIL", "under age")
            type = "FAIL"
        }
    } else if(!dateOfBirth && mol) {
        text = getDateOfBirthIntoMol;
        type = "PASS"
        // console.log("checkDateOfBirth", getDateOfBirthIntoMol, "PASS", "date found")
    } else {
        // console.log("checkDateOfBirth", getDateOfBirthIntoMol, getActulDateOfBirth,  "FAIL", "both dates not found")
        text = ""
        type = "FAIL"
    }


    return {type, text}
}

const checkValue = (key, value, row) => {
    console.log(value , "values")
    if(key === COLUMN_KEYS.dateOfBirth){
        return checkDateOfBirth(row[COLUMN_KEYS.wpsPersonId], row[COLUMN_KEYS.dateOfBirth])
    } else if(!value){
        return {
            type: "FAIL", 
            text: ""
        }
    } else {
        return {
            type: "PASS", 
            text: value
        }
    }
    

    
}

export  const dataChecker = (jsonData) => {


    const COLUMN_VALUES = Object.values(COLUMN_KEYS);
    const REQ_COLUMN_VALUES = Object.values(REQ_COLUMN_KEYS) ;


    const workbookEx = new ExcelJS.Workbook();
            const worksheet = workbookEx.addWorksheet('Sheet1');
    
            worksheet.columns = COLUMN_VALUES.map(column => ({ header: column, key: column }));
        
            jsonData.forEach((row, rowIndex) => {
            

                const newRow = worksheet.addRow(row);
                let rowHasMissingData = false;
            
                if(rowIndex !== 0){
                    REQ_COLUMN_VALUES.forEach((column) => {
                    
                        const cell = newRow.getCell(column);
                        let hasValue = checkValue(column, cell.value, row)
                        console.log('hasValue', hasValue)
                        

                        if (hasValue?.type === "FAIL") {
                            cell.value = hasValue?.text || '';
                            rowHasMissingData = true;
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'cf1322' }, 
                            };
                            cell.font = {
                                color: { argb: 'FFFFFFFF' }, 
                            };
                        } else {
                            cell.value = hasValue?.text || '';
                        }
                    
                        // cell.value = hasValue?.text || '';

                        // if (hasValue?.type === "FAIL") {
                        //     rowHasMissingData = true;
                        //     cell.value = hasValue?.text || '';
                        //     cell.fill = {
                        //         type: 'pattern',
                        //         pattern: 'solid',
                        //         fgColor: { argb: 'cf1322' }, 
                        //     };
                        //     cell.font = {
                        //         color: { argb: 'FFFFFFFF' }, 
                        //     };
                        // }
                    });

                    if (rowHasMissingData) {
                        COLUMN_VALUES.forEach((column) => {
                            const cell = newRow.getCell(column);
                            if (!cell.fill) {
                                cell.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: 'fff2f0' }, 
                                };
                                cell.font = {
                                    color: { argb: 'ff4d4f' }, 
                                };
                            }
                        });
                    }
                }
        

                // if (!)
            });

            return workbookEx

   }


   // jsonData.forEach((row) => {
            //     const newRow = worksheet.addRow(row);
            //     let rowHasMissingData = false;
            
            //     requiredColumns.forEach((column) => {
            //         const cell = newRow.getCell(column);
            //         if (!cell.value) {
            //             rowHasMissingData = true;
            //             cell.value = '';
            //             cell.fill = {
            //                 type: 'pattern',
            //                 pattern: 'solid',
            //                 fgColor: { argb: 'cf1322' }, 
            //             };
            //             cell.font = {
            //                 color: { argb: 'FFFFFFFF' }, 
            //             };
            //         }
            //     });
            
                

            //     if (rowHasMissingData) {
            //         columns.forEach((column) => {
            //             const cell = newRow.getCell(column);
            //             if (cell.value !== '') {
            //                 cell.fill = {
            //                     type: 'pattern',
            //                     pattern: 'solid',
            //                     fgColor: { argb: 'fff2f0' }, 
            //                 };
            //                 cell.font = {
            //                     color: { argb: 'ff4d4f' }, 
            //                 };
            //             }
            //         });
            //     }
            // });
            