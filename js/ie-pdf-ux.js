$(document).ready(function () {
  try {
    // intialize config variables
    let zipLevel = "";

    let baseUrlSection = "/us-en/active-iq-unified-manager-913/pdfs/";
    const flavor = $("body").data("flavor");
    if (flavor) {
      baseUrlSection += flavor + "/";
    }
    baseUrlSection += "sidebar/";

    let zipFilename = "";
    zipLevel = zipLevel !== ""?zipLevel:1;
    zipFilename = zipFilename !== ''?zipFilename:"active-iq-unified-manager-913.zip";
    
    // remove container class from pdf tree not having any sub child
    $("#toggleContainerPdf li.pdf-ux-container").not(".active").removeClass("pdf-ux-container");
    const pdfUrls = getPdfUrls(zipLevel, baseUrlSection);

    // get pdf urls for a specific level
    function getPdfUrls(zipLevel, baseUrlSection){
      let pdfUrls = [];
      for(let i=1; i<=zipLevel; i++) {
        pdfUrls = pdfUrls.concat(getPdfUrlsByLevel(i, true, baseUrlSection))
      }
      pdfUrls = pdfUrls.concat(getPdfUrlsByLevel(zipLevel, false, baseUrlSection))

      return pdfUrls;
    }

    function getPdfUrlsByLevel(level, terminus, baseUrlSection) {
      const pdfUrls = [];
      const terminus_level = terminus ? '#' : '';
      let li_entries = $(`[data-li-level="${level}${terminus_level}"]`);
      li_entries.each(function(index, li) { 
        if(!($(li).data('pdfExists'))) return;
        const pdfName = $(li).data('pdfFilename').trim().replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
        pdfUrls.push(baseUrlSection+pdfName);
      });  
      return pdfUrls;
    }

    // zip all pdf files
    function zipPdf(){
      let zip = new JSZip();
      let count = 0;
      // disable link and start spinner
      
      $("#zip-link-popup").removeClass("hide");
      

      pdfUrls.forEach(function(url){
        let filename = url.substring(url.lastIndexOf('/')+1);
        // loading a file and add it in a zip file
        JSZipUtils.getBinaryContent(url, function (err, data) {
          if(err) {
            count++;
            console.error("Failed to load PDF: " + err.message);
          } else {
            count++;
            zip.file(filename, data, {binary:true});
            if (count == pdfUrls.length) {
              zip.generateAsync({type:'blob'}).then(function(content) {
                if(!$("#zip-link-popup").hasClass("hide")) {
                  saveAs(content, zipFilename);
                  // enable link and stop spinner
                  $("#zip-link-popup .downloading-progress").addClass("hide");
                  $("#zip-link-popup .download-complete").removeClass("hide");
                  setTimeout(function(){
                    $("#zip-link-popup").addClass("hide");
                    $("#zip-link-popup .downloading-progress").removeClass("hide");
                    $("#zip-link-popup .download-complete").addClass("hide");
                  },2000);
                }
              });
            }
          }
        });
      });
    }

    // bind zipPdf link click
    $("#zipPdf").click(function(event){
      event.preventDefault();
      zipPdf();
      event.stopImmediatePropagation();
    });
  } catch (err) {
    console.log(err.message);
    // enable link and stop spinner
    $("#zip-link-popup").addClass("hide");
  }
});
