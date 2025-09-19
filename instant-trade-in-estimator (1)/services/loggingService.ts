import type { BoatFormData, Estimate } from '../types';

export const logEstimateToCSV = (formData: BoatFormData, estimate: Estimate, existingLog: string): string => {
    const headers = [
        'Timestamp',
        'LeadQuality',
        'EstimatedLow',
        'EstimatedHigh',
        'FullName',
        'Email',
        'Phone',
        'PostalCode',
        'BoatType',
        'Year',
        'Make',
        'Model',
        'HIN',
        'EngineMake',
        'Horsepower',
        'EngineHours',
        'TrailerIncluded',
        'CosmeticCondition',
        'MechanicalCondition'
    ];
    
    const values = [
        new Date().toISOString(),
        estimate.leadQuality,
        estimate.low,
        estimate.high,
        formData.fullName,
        formData.email,
        formData.phone,
        formData.postalCode,
        formData.boatType,
        formData.year,
        formData.make,
        formData.model,
        formData.hin,
        formData.engineMake,
        formData.horsepower,
        formData.engineHours,
        formData.trailer ? 'Yes' : 'No',
        formData.cosmeticCondition,
        formData.mechanicalCondition
    ];

    const csvRow = values.map(value => {
        const strValue = String(value ?? '');
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
    }).join(',');

    if (existingLog) {
        return `${existingLog}\n${csvRow}`;
    } else {
        return `${headers.join(',')}\n${csvRow}`;
    }
};

export const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};