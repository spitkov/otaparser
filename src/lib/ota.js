/**
 * Convert GitHub blob URL to raw URL
 * @param {string} url - The GitHub URL to convert
 * @returns {string} - The converted raw URL
 */
function convertToRawGitHubUrl(url) {
  try {
    const githubBlobRegex = /github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.*)/;
    const match = url.match(githubBlobRegex);
    
    if (match) {
      const [, owner, repo, branch, path] = match;
      return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${path}`;
    }
    
    return url;
  } catch (error) {
    console.error('Error converting GitHub URL:', error);
    return url;
  }
}

/**
 * Parse OTA data from a URL
 * @param {string} url - The URL to fetch OTA data from
 * @returns {Promise<Object>} - The parsed OTA data
 */
export async function parseOtaUrl(url) {
  try {
    const convertedUrl = convertToRawGitHubUrl(url);
    const response = await fetch(convertedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error parsing OTA URL:', error);
    throw error;
  }
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - The size in bytes
 * @returns {string} - Formatted size string
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format timestamp to human readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted date string
 */
export function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function validateOtaData(data) {
  if (!data) return false;
  
  // Check if it's the standard OTA format with response array
  if (data.response && Array.isArray(data.response) && data.response.length > 0) {
    return true;
  }
  
  // Check if it's the LineageOS builds array format
  if (Array.isArray(data) && data.length > 0) {
    // Check if it has the expected properties for LineageOS format
    const firstItem = data[0];
    if (firstItem.date && firstItem.datetime && Array.isArray(firstItem.files)) {
      return true;
    }
    
    // Check if it's an array of mixed items (could be response items)
    if (firstItem.filename || firstItem.device || firstItem.version) {
      return true;
    }
  }
  
  return false;
}

export function normalizeOtaData(data) {
  if (!data) return { response: [{}] };
  
  // If it's already in the standard format, return it
  if (data.response && Array.isArray(data.response)) {
    return data;
  }
  
  // If it's an array (LineageOS builds format or mixed format), convert it
  if (Array.isArray(data)) {
    // Check if it's LineageOS format with builds and files
    if (data.length > 0 && data[0].files && Array.isArray(data[0].files)) {
      // Find the main ROM file in the first build
      const mainBuild = data[0];
      const mainFile = mainBuild.files.find(f => 
        f.filename && f.filename.endsWith('.zip') && 
        (f.filename.includes('signed') || f.filename.includes('nightly') || f.filename.includes('official'))
      ) || mainBuild.files[0];
      
      // Extract device name from filename (lineage-22.1-20250308-nightly-renoir-signed.zip)
      const filenameParts = mainFile.filename.split('-');
      const deviceName = filenameParts.length >= 4 ? filenameParts[3] : 'Unknown';
      
      // Create a response object in the standard format
      return {
        response: [{
          device: deviceName,
          oem: 'LineageOS',
          maintainer: 'LineageOS Team',
          filename: mainFile.filename,
          download: mainFile.url,
          timestamp: mainBuild.datetime.toString(),
          size: mainFile.size.toString(),
          version: mainBuild.version,
          buildtype: mainBuild.type,
          sha256: mainFile.sha256,
          // Add additional files as separate properties
          additionalFiles: mainBuild.files.filter(f => f.filename !== mainFile.filename),
          // Store all builds for reference
          allBuilds: data
        }]
      };
    } 
    // Check if it's a simple array of items (mixed format)
    else {
      // Convert array to response format
      return {
        response: data.map(item => {
          // Handle LineageOS API format items
          if (item.datetime && item.files) {
            const mainFile = item.files.find(f => 
              f.filename && f.filename.endsWith('.zip')
            ) || item.files[0];
            
            const filenameParts = mainFile.filename.split('-');
            const deviceName = filenameParts.length >= 4 ? filenameParts[3] : 'Unknown';
            
            return {
              device: deviceName,
              oem: 'LineageOS',
              maintainer: 'LineageOS Team',
              filename: mainFile.filename,
              download: mainFile.url,
              timestamp: item.datetime.toString(),
              size: mainFile.size.toString(),
              version: item.version,
              buildtype: item.type,
              sha256: mainFile.sha256,
              additionalFiles: item.files.filter(f => f.filename !== mainFile.filename)
            };
          }
          // Just return the item as is if it's already in a compatible format
          return item;
        })
      };
    }
  }
  
  // If it's not in a recognized format, return a minimal structure
  return { response: [{}] };
} 