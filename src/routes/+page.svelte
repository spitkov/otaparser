<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import UrlInput from '$lib/components/UrlInput.svelte';
  import OtaDisplay from '$lib/components/OtaDisplay.svelte';
  import { parseOtaUrl, validateOtaData, normalizeOtaData } from '$lib/ota.js';
  
  let otaData = null;
  let urlInputComponent;
  let fileInput;
  
  async function handleUrlSubmit(event) {
    const url = event.detail;
    
    try {
      const data = await parseOtaUrl(url);
      
      if (!validateOtaData(data)) {
        urlInputComponent.setError('Invalid OTA data format');
        otaData = null;
      } else {
        otaData = normalizeOtaData(data);
      }
    } catch (error) {
      console.error('Error parsing OTA data:', error);
      urlInputComponent.setError(`Failed to parse OTA data: ${error.message}`);
      otaData = null;
    } finally {
      urlInputComponent.setLoading(false);
    }
  }
  
  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!validateOtaData(data)) {
          alert('Invalid OTA data format');
          otaData = null;
        } else {
          otaData = normalizeOtaData(data);
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert(`Failed to parse JSON file: ${error.message}`);
        otaData = null;
      }
    };
    reader.readAsText(file);
  }
  
  function loadExampleData() {
    otaData = {
      "response": [
        {
          "maintainer": "Rocky7842",
          "oem": "Xiaomi",
          "device": "Mi 11 Lite 5G",
          "filename": "crDroidAndroid-15.0-20250302-renoir-v11.2.zip",
          "download": "https://github.com/Rocky7842/OTA_provider/releases/download/renoir-crDroid-11.2-20250302/crDroidAndroid-15.0-20250302-renoir-v11.2.zip",
          "timestamp": "1740919940",
          "md5": "12732da94a3f1d166ecea39f19197d0e",
          "sha256": "87d0c1fd264f06a1614afc2f51d31149b11a68a1e6dc960c80f8385b6c3fa561",
          "size": "1590332287",
          "version": "11.2",
          "buildtype": "Monthly",
          "forum": "https://xdaforums.com/t/4716756/",
          "gapps": "https://github.com/MindTheGapps/15.0.0-arm64/releases",
          "firmware": "",
          "modem": "",
          "bootloader": "",
          "recovery": "https://github.com/Rocky7842/OTA_provider/releases/download/renoir-crDroid-11.2-20250302/recovery.img",
          "paypal": "https://www.paypal.com/paypalme/EricRocky7842",
          "telegram": "",
          "dt": "https://github.com/Rocky7842/android_device_xiaomi_renoir",
          "common-dt": "https://github.com/Rocky7842/android_device_xiaomi_sm8350-common",
          "kernel": "https://github.com/Rocky7842/android_kernel_xiaomi_sm8350"
        }
      ]
    };
  }
  
  function loadPartialExampleData() {
    otaData = {
      "response": [
        {
          "maintainer": "Rocky7842",
          "oem": "Xiaomi",
          "device": "Mi 11 Lite 5G",
          "filename": "crDroidAndroid-15.0-20250302-renoir-v11.2.zip",
          "download": "https://github.com/Rocky7842/OTA_provider/releases/download/renoir-crDroid-11.2-20250302/crDroidAndroid-15.0-20250302-renoir-v11.2.zip",
          "version": "11.2"
        }
      ]
    };
  }
  
  function loadLineageExample() {
    otaData = [
      {
        "date": "2025-03-08",
        "datetime": 1741392000,
        "files": [
          {
            "date": "2025-03-08",
            "datetime": 1741392000,
            "filename": "lineage-22.1-20250308-nightly-renoir-signed.zip",
            "filepath": "/full/renoir/20250308/lineage-22.1-20250308-nightly-renoir-signed.zip",
            "os_patch_level": "2025-02",
            "sha1": "24cab06699a81bfd4a1dd0cbcf7aafdc857ba54b",
            "sha256": "8ab70ef2cfa9ce2b35e94372ca12b61bf9cea73865b4d4d3b1dfa3032131dba1",
            "size": 1396032856,
            "type": "nightly",
            "url": "https://mirrorbits.lineageos.org/full/renoir/20250308/lineage-22.1-20250308-nightly-renoir-signed.zip"
          },
          {
            "filename": "boot.img",
            "filepath": "/full/renoir/20250308/boot.img",
            "sha1": "634e5e3efc8ef3d0afc6ea3619a8b245ad229911",
            "sha256": "9633daaa42f6ed32fd2ddf124f89e58b1da6a4f1a0ed02a42ca654318c4b97b5",
            "size": 201326592,
            "url": "https://mirrorbits.lineageos.org/full/renoir/20250308/boot.img"
          },
          {
            "filename": "dtbo.img",
            "filepath": "/full/renoir/20250308/dtbo.img",
            "sha1": "a1b66f167c5117875446b7eedd8f19921fa96e54",
            "sha256": "7867420c37651c7dfd74d2004ad59fa4dad46185ddfa60054def22639c711e61",
            "size": 25165824,
            "url": "https://mirrorbits.lineageos.org/full/renoir/20250308/dtbo.img"
          }
        ],
        "os_patch_level": "2025-02",
        "type": "nightly",
        "version": "22.1"
      }
    ];
    otaData = normalizeOtaData(otaData);
  }
  
  function loadLineageApiExample() {
    // Example data from LineageOS API
    const apiData = [
      {
        "date": "2025-03-08",
        "datetime": 1741392000,
        "id": "ff035a61d179ae3b91c71cdd8601dd03fea59f764e6b90bc67fe49a588cd139a",
        "romtype": "nightly",
        "size": 1396032856,
        "url": "https://mirrorbits.lineageos.org/full/renoir/20250308/lineage-22.1-20250308-nightly-renoir-signed.zip",
        "version": "22.1",
        "filename": "lineage-22.1-20250308-nightly-renoir-signed.zip"
      },
      {
        "date": "2025-03-01",
        "datetime": 1740787200,
        "id": "ac520f95d0d47c3aa27e301467b91d739afbb6601858d487e9f83671aa3855c7",
        "romtype": "nightly",
        "size": 1395391903,
        "url": "https://mirrorbits.lineageos.org/full/renoir/20250301/lineage-22.1-20250301-nightly-renoir-signed.zip",
        "version": "22.1",
        "filename": "lineage-22.1-20250301-nightly-renoir-signed.zip"
      }
    ];
    
    otaData = normalizeOtaData(apiData);
  }
</script>

<div class="flex flex-col min-h-screen">
  <Header />
  
  <main class="flex-1">
    <div class="container mx-auto py-8">
      <UrlInput bind:this={urlInputComponent} on:submit={handleUrlSubmit} />
      
      <div class="w-full max-w-3xl mx-auto mt-4 px-4">
        <div class="bg-[#1a1a1a] rounded-lg p-4 border border-[#333] flex items-center justify-between">
          <span class="text-gray-300 text-sm">Or upload a JSON file</span>
          <label class="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-md transition-colors cursor-pointer inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload JSON
            <input 
              type="file" 
              accept=".json" 
              class="hidden" 
              bind:this={fileInput}
              on:change={handleFileUpload}
            />
          </label>
        </div>
      </div>
      
      {#if !otaData}
        <div class="w-full max-w-3xl mx-auto mt-8 px-4">
          <div class="bg-[#1a1a1a] rounded-lg shadow-lg p-6 border border-[#333] text-center">
            <h2 class="text-xl font-medium text-white mb-4">No OTA Data</h2>
            <p class="text-gray-400 mb-6">Enter a URL above, upload a JSON file, or use one of the example data options.</p>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <button 
                on:click={loadExampleData}
                class="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2 justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                crDroid Example
              </button>
              
              <button 
                on:click={loadLineageExample}
                class="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2 justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                </svg>
                LineageOS Files
              </button>
              
              <button 
                on:click={loadLineageApiExample}
                class="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2 justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                LineageOS API
              </button>
              
              <button 
                on:click={loadPartialExampleData}
                class="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2 justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Partial Example
              </button>
            </div>
            
            <div class="mt-6 text-gray-400 text-sm">
              <p>Try the URL: <code class="bg-[#222] px-2 py-1 rounded">https://download.lineageos.org/api/v2/devices/renoir/builds</code></p>
            </div>
          </div>
        </div>
      {:else}
        <OtaDisplay {otaData} />
      {/if}
    </div>
  </main>
  
  <Footer />
</div>
