<script>
  import { formatBytes, formatDate } from '$lib/ota.js';
  
  export let otaData = null;
  
  let selectedBuild = 0;
  
  $: allBuilds = otaData?.response?.[0]?.allBuilds || [];
  $: hasMultipleBuilds = allBuilds.length > 1;
  $: hasMultipleResponses = otaData?.response?.length > 1;
  
  $: currentBuild = hasMultipleBuilds ? allBuilds[selectedBuild] || null : null;
  
  $: mainFile = currentBuild?.files ? 
    currentBuild.files.find(f => 
      f.filename && f.filename.endsWith('.zip') && 
      (f.filename.includes('signed') || f.filename.includes('nightly') || f.filename.includes('official'))
    ) || currentBuild.files[0] || null : null;
  
  $: additionalFiles = currentBuild?.files ? 
    currentBuild.files.filter(f => f !== mainFile) : 
    otaData?.response?.[0]?.additionalFiles || [];
  
  $: deviceInfo = otaData?.response?.[selectedBuild] ? {
    oem: otaData.response[selectedBuild].oem || 'Not available',
    device: otaData.response[selectedBuild].device || 'Not available',
    maintainer: otaData.response[selectedBuild].maintainer || 'Not available',
    version: otaData.response[selectedBuild].version || currentBuild?.version || 'Not available',
    buildtype: otaData.response[selectedBuild].buildtype || otaData.response[selectedBuild].romtype || currentBuild?.type || 'Not available'
  } : null;
  
  $: fileInfo = otaData?.response?.[selectedBuild] ? {
    filename: otaData.response[selectedBuild].filename || mainFile?.filename || 'Not available',
    size: otaData.response[selectedBuild].size || mainFile?.size || '0',
    timestamp: otaData.response[selectedBuild].timestamp || otaData.response[selectedBuild].datetime || currentBuild?.datetime || null,
    md5: otaData.response[selectedBuild].md5 || 'Not available',
    sha256: otaData.response[selectedBuild].sha256 || otaData.response[selectedBuild].id || mainFile?.sha256 || 'Not available'
  } : null;
  
  $: links = otaData?.response?.[selectedBuild] ? {
    download: otaData.response[selectedBuild].download || mainFile?.url || '',
    forum: otaData.response[selectedBuild].forum || '',
    gapps: otaData.response[selectedBuild].gapps || '',
    firmware: otaData.response[selectedBuild].firmware || '',
    modem: otaData.response[selectedBuild].modem || '',
    bootloader: otaData.response[selectedBuild].bootloader || '',
    recovery: otaData.response[selectedBuild].recovery || '',
    paypal: otaData.response[selectedBuild].paypal || '',
    telegram: otaData.response[selectedBuild].telegram || ''
  } : null;
  
  $: sourceLinks = otaData?.response?.[selectedBuild] ? {
    dt: otaData.response[selectedBuild].dt || '',
    'common-dt': otaData.response[selectedBuild]['common-dt'] || '',
    kernel: otaData.response[selectedBuild].kernel || ''
  } : null;
  
  $: isLineageFormat = Boolean(
    (currentBuild?.datetime && currentBuild?.files) || 
    (otaData?.response?.[selectedBuild]?.datetime && otaData?.response?.[selectedBuild]?.id)
  );
  
  function selectBuild(index) {
    selectedBuild = index;
  }
</script>

{#if otaData && otaData.response && otaData.response.length > 0}
  <div class="w-full max-w-3xl mx-auto mt-8 mb-16 px-4">
    <div class="bg-[#1a1a1a] rounded-lg shadow-lg border border-[#333] overflow-hidden">
      <div class="bg-[#222] p-6 border-b border-[#333]">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {#if isLineageFormat}
              <h2 class="text-2xl font-bold text-white">LineageOS</h2>
              <p class="text-gray-400">From filename: {fileInfo.filename.split('-')[3] || 'Unknown device'}</p>
            {:else}
              <h2 class="text-2xl font-bold text-white">{deviceInfo.device}</h2>
              <p class="text-gray-400">{deviceInfo.oem}</p>
            {/if}
          </div>
          <div class="flex flex-wrap gap-2">
            {#if deviceInfo.version !== 'Not available'}
              <span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                v{deviceInfo.version}
              </span>
            {/if}
            {#if deviceInfo.buildtype !== 'Not available'}
              <span class="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                {deviceInfo.buildtype}
              </span>
            {/if}
          </div>
        </div>
        {#if !isLineageFormat}
          <div class="mt-4 text-gray-300">
            <p>Maintained by <span class="text-blue-400">{deviceInfo.maintainer}</span></p>
          </div>
        {/if}
      </div>
      
      {#if hasMultipleBuilds}
        <div class="p-4 bg-[#1d1d1d] border-b border-[#333]">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Available Builds</h3>
          <div class="flex flex-wrap gap-2">
            {#each allBuilds as build, i}
              <button 
                class="px-3 py-1 text-xs rounded-full transition-colors {i === selectedBuild ? 'bg-blue-600 text-white' : 'bg-[#333] text-gray-300 hover:bg-[#444]'}"
                on:click={() => selectBuild(i)}
              >
                {build.date}
              </button>
            {/each}
          </div>
        </div>
      {:else if hasMultipleResponses}
        <div class="p-4 bg-[#1d1d1d] border-b border-[#333]">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Available Builds</h3>
          <div class="flex flex-wrap gap-2">
            {#each otaData.response as _, i}
              <button 
                class="px-3 py-1 text-xs rounded-full transition-colors {i === selectedBuild ? 'bg-blue-600 text-white' : 'bg-[#333] text-gray-300 hover:bg-[#444]'}"
                on:click={() => selectBuild(i)}
              >
                {otaData.response[i].date || new Date(parseInt(otaData.response[i].timestamp || otaData.response[i].datetime) * 1000).toISOString().split('T')[0]}
              </button>
            {/each}
          </div>
        </div>
      {/if}
      
      <div class="p-6 border-b border-[#333]">
        <h3 class="text-lg font-medium text-white mb-4">File Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-gray-400 text-sm">Filename</p>
            <p class="text-white font-mono text-sm break-all">{fileInfo.filename}</p>
          </div>
          <div>
            <p class="text-gray-400 text-sm">Size</p>
            <p class="text-white">{fileInfo.size === '0' ? 'Not available' : formatBytes(fileInfo.size)}</p>
          </div>
          <div>
            <p class="text-gray-400 text-sm">Build Date</p>
            <p class="text-white">{fileInfo.timestamp ? formatDate(fileInfo.timestamp) : 'Not available'}</p>
          </div>
          
          {#if isLineageFormat}
            <div class="md:col-span-2">
              <p class="text-gray-400 text-sm">SHA256</p>
              <p class="text-white font-mono text-sm break-all">{fileInfo.sha256}</p>
            </div>
          {:else}
            <div>
              <p class="text-gray-400 text-sm">MD5</p>
              <p class="text-white font-mono text-sm break-all">{fileInfo.md5}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-gray-400 text-sm">SHA256</p>
              <p class="text-white font-mono text-sm break-all">{fileInfo.sha256}</p>
            </div>
          {/if}
        </div>
      </div>
      
      <div class="p-6 border-b border-[#333]">
        <h3 class="text-lg font-medium text-white mb-4">Download Links</h3>
        
        {#if !links.download && !links.recovery && !links.forum && !links.gapps && !links.paypal && additionalFiles.length === 0 && currentBuild?.files.length === 0}
          <p class="text-gray-400 italic">No download links available</p>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#if links.download}
              <div>
                <a href={links.download} target="_blank" rel="noopener noreferrer" 
                   class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors w-full justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download ROM
                </a>
              </div>
            {/if}
            
            {#if links.recovery}
              <div>
                <a href={links.recovery} target="_blank" rel="noopener noreferrer" 
                   class="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors w-full justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Download Recovery
                </a>
              </div>
            {/if}
            
            {#if links.forum}
              <div>
                <a href={links.forum} target="_blank" rel="noopener noreferrer" 
                   class="flex items-center gap-2 bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-md transition-colors w-full justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  Forum Thread
                </a>
              </div>
            {/if}
            
            {#if links.gapps}
              <div>
                <a href={links.gapps} target="_blank" rel="noopener noreferrer" 
                   class="flex items-center gap-2 bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-md transition-colors w-full justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 11H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"></path>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  GApps
                </a>
              </div>
            {/if}
            
            {#if links.paypal}
              <div>
                <a href={links.paypal} target="_blank" rel="noopener noreferrer" 
                   class="flex items-center gap-2 bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-md transition-colors w-full justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Donate
                </a>
              </div>
            {/if}
          </div>
          
          {#if additionalFiles.length > 0}
            <div class="mt-6">
              <h4 class="text-md font-medium text-white mb-3">Additional Files</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {#each additionalFiles as file}
                  <a href={file.url} target="_blank" rel="noopener noreferrer" 
                     class="flex items-center gap-2 bg-[#222] hover:bg-[#333] text-white px-3 py-2 rounded-md transition-colors border border-[#444]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <div class="flex-1 overflow-hidden">
                      <p class="text-sm truncate">{file.filename}</p>
                      <p class="text-xs text-gray-400">{formatBytes(file.size)}</p>
                    </div>
                  </a>
                {/each}
              </div>
            </div>
          {/if}
          
          {#if hasMultipleBuilds && currentBuild?.files?.length > 0}
            <div class="mt-6">
              <h4 class="text-md font-medium text-white mb-3">Build Files ({currentBuild.date})</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {#each currentBuild.files as file}
                  <a href={file.url} target="_blank" rel="noopener noreferrer" 
                     class="flex items-center gap-2 bg-[#222] hover:bg-[#333] text-white px-3 py-2 rounded-md transition-colors border border-[#444]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <div class="flex-1 overflow-hidden">
                      <p class="text-sm truncate">{file.filename}</p>
                      <p class="text-xs text-gray-400">{formatBytes(file.size)}</p>
                    </div>
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        {/if}
      </div>
      
      {#if !isLineageFormat && (sourceLinks.dt || sourceLinks['common-dt'] || sourceLinks.kernel)}
        <div class="p-6">
          <h3 class="text-lg font-medium text-white mb-4">Source Code</h3>
          
          {#if !sourceLinks.dt && !sourceLinks['common-dt'] && !sourceLinks.kernel}
            <p class="text-gray-400 italic">No source code links available</p>
          {:else}
            <div class="grid grid-cols-1 gap-3">
              {#if sourceLinks.dt}
                <a href={sourceLinks.dt} target="_blank" rel="noopener noreferrer" 
                   class="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  Device Tree
                </a>
              {/if}
              
              {#if sourceLinks['common-dt']}
                <a href={sourceLinks['common-dt']} target="_blank" rel="noopener noreferrer" 
                   class="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  Common Device Tree
                </a>
              {/if}
              
              {#if sourceLinks.kernel}
                <a href={sourceLinks.kernel} target="_blank" rel="noopener noreferrer" 
                   class="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  Kernel Source
                </a>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if} 