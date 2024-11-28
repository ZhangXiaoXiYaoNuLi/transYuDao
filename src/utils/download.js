export const download = (type, data, name) => {
    let dataTrack = '';
    const a = document.createElement('a');
    switch (type) {
        case 'xml':
            dataTrack = 'bpmn';
            break;
        case 'svg':
            dataTrack = 'svg';
            break;
        default:
            break;
    }

    name = name || `diagram.${dataTrack}`;
    a.setAttribute('href', `data:application/bpmn20-xml;charset=UTF-8,${encodeURIComponent(data)}`);
    a.setAttribute('target', '_blank');
    a.setAttribute('dataTrack', `diagram:download-${dataTrack}`);
    a.setAttribute('download', name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export default {
    download
}
