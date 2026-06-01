
/**
 * Utility for exporting and importing CUBRID Host connections.
 * Tailored to be compatible with d-cms (CUBRID Manager) XML format.
 */

/**
 * Exports a list of hosts to an XML file.
 * Following d-cms logic: Passwords are NOT included.
 * 
 * @param {Array} hosts - Array of host objects from Redux state
 * @param {string} fileName - Default filename for download
 */
export const exportHostsToXml = (hosts, fileName = 'export_servers.xml') => {
  if (!hosts || hosts.length === 0) return;

  const doc = document.implementation.createDocument(null, 'hosts', null);
  const root = doc.documentElement;

  hosts.forEach(host => {
    const hostNode = doc.createElement('host');
    
    // Mapping b-cms fields to d-cms XML attributes
    hostNode.setAttribute('id', host.uid || ''); // d-cms uses id, but in b-cms uid is unique
    hostNode.setAttribute('name', host.alias || host.address || ''); // d-cms 'name' is b-cms 'alias'
    hostNode.setAttribute('address', host.address || '');
    hostNode.setAttribute('port', String(host.port || '8001'));
    hostNode.setAttribute('user', host.id || ''); // d-cms 'user' is b-cms 'id'
    hostNode.setAttribute('password', ''); // Passwords not included in export per d-cms
    hostNode.setAttribute('savePassword', 'false');
    hostNode.setAttribute('jdbcDriver', 'default');
    
    root.appendChild(hostNode);
  });

  const serializer = new XMLSerializer();
  const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(doc);
  
  const blob = new Blob([xmlString], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function unescapePrefsXml(value) {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function extractHostsXmlFromPrefs(rawText) {
  const line = rawText
    .split('\n')
    .find((entry) => entry.startsWith('CUBRID_SERVERS='));
  if (!line) return null;
  const escapedXml = line.slice('CUBRID_SERVERS='.length);
  return escapedXml ? unescapePrefsXml(escapedXml) : null;
}

/**
 * Parses host XML or legacy CUBRID desktop prefs text and returns host entries.
 *
 * Supported inputs:
 * - `<hosts>...</hosts>` XML
 * - `.prefs` containing `CUBRID_SERVERS=<?xml ...><hosts>...`
 *
 * @param {string} rawInput - XML text or prefs text
 * @returns {Array} - Array of host objects ready for addHost action
 */
export const parseHostsXml = (rawInput) => {
  const input = String(rawInput || '').trim();
  const xmlString = input.startsWith('<')
    ? input
    : extractHostsXmlFromPrefs(input);
  if (!xmlString) {
    throw new Error('No CUBRID host XML found. Provide a <hosts> XML or .prefs with CUBRID_SERVERS.');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  
  // Check for parser errors
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('Invalid XML format. Please select a valid CUBRID Host export file.');
  }

  // Check if it's the right XML for hosts
  if (doc.documentElement.nodeName !== 'hosts') {
    throw new Error('Incorrect file format. Expected <hosts> root element.');
  }

  const hostNodes = doc.getElementsByTagName('host');
  if (hostNodes.length === 0) {
    throw new Error('No host connection information found in the selected file.');
  }
  
  const parsedHosts = [];
  for (let i = 0; i < hostNodes.length; i++) {
    const node = hostNodes[i];
    const address = node.getAttribute('address');
    if (!address) continue; // Skip if mandatory address is missing

    parsedHosts.push({
      // Only map fields used by web manager addHost.
      alias: node.getAttribute('name') || node.getAttribute('id') || address,
      address,
      port: node.getAttribute('port') || '8001',
      id: node.getAttribute('user') || 'admin',
      // Legacy desktop passwords are not reusable for WM host login.
      password: '',
    });
  }
  
  if (parsedHosts.length === 0) {
    throw new Error('The selected file contains no valid host connections.');
  }

  return parsedHosts;
};
