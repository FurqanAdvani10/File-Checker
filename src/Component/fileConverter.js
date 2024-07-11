import React, { useState } from 'react';
import { message, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { read, utils } from 'xlsx';
import './main.css';
import { checkDateOfBirth, COLUMN_KEYS,  dataChecker } from './helper';



const FileReaders = (json) => {
    const { Dragger } = Upload;
    const [fileList, setFileList] = useState([]);

    const checkAge = (data) => {
 
        
        let updatedData = data.filter((o, i) => i !== 0)

        updatedData?.map(obj => {
            let mol = obj[COLUMN_KEYS.wpsPersonId]
            let dateOfBirth = obj[COLUMN_KEYS.dateOfBirth]
            console.log(checkDateOfBirth(mol, dateOfBirth))
        })
   }


 

   const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(sheet);

        // checkAge(jsonData);

        const workbookEx = dataChecker(jsonData);

        const buffer = await workbookEx.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'DataSheet.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    reader.readAsArrayBuffer(file.originFileObj);
};

    
    

    const props = {
        name: 'file',
        multiple: false,
        accept: ".xlsx",
        beforeUpload: file => {
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            if (!isExcel) {
                message.error(`${file.name} is not a .xlsx file`);
            }
            return isExcel || Upload.LIST_IGNORE;
        },
        onChange(info) {
            setTimeout(() => {
                const newFileList = info?.fileList?.map(file => {
                    if (file.uid === info.file.uid) {
                        handleFileUpload(file);
                        return { ...file, status: 'done' };
                    }
                    return file;
                });
                message.success(`${info.file.name} file uploaded successfully.`);
                setFileList(newFileList);
            }, 2000);
        },
        fileList,
    };

    return (
        <div className='converter-main'>
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for a single upload. Strictly prohibited from uploading banned files.
                </p>
            </Dragger>
        </div>
    );
};

export default FileReaders;
