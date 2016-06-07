//all the path given relatively to mrmlToJson.js script
module.exports = {
   mrmlFileLocation : "../../slicer/brain-atlas.mrml",
    colorTableFileLocation : "../../slicer/colortables/hncma-atlas-lut.ctbl",
    baseURL : "../../slicer/",
    vtkFilesDirectory : "models/",
    jsonResultFileName : "../atlasStructure.json",
    jsonLDResultFileName : "../atlasStructureLD.json",
    jsonHashResultFileName : "../atlasStructureHash.json",
    filesDisplayName : {
        "volumes/imaging/A1_grayT1-1mm_resample.nrrd" : "T1",
        "volumes/imaging/A1_grayT2-1mm_resample.nrrd" : "T2",
        "volumes/labels/hncma-atlas.nrrd" : "Label Map",
    },
    header : {
        "@type": "Header",
        "species": "human",
        "organ": "brain",
        "name" : "The SPL/NAC Brain Atlas",
        "license" : "?",
        "citation" : "?",
        "version" : "1",
        "contact" : "https://github.com/stity/spl-brain-atlas",
        "comment" : "",
        "coordinateSystem" : "self defined",
        "root" : []
    },
    labelMapFiles : [{ 
        name : "volumes/labels/hncma-atlas.nrrd",
        includes : "*" 
    }/* exclude skin because it does not match the others volumes
    ,{ 
        name : "../../slicer/volumes/labels/skin.nrrd",
        includes : [3]
    }*/],
    "backgroundImages" : ["volumes/imaging/A1_grayT1-1mm_resample.nrrd", "volumes/imaging/A1_grayT2-1mm_resample.nrrd"],
    "@context" : { // for JSON LD compatibility, specify places where aplication expect a reference
        "@vocab": "http://www.openanatomy.org/schema/v1/#",
        "backgroundImage": {
            "@type": "@id"
        },
        "root": {
            "@type": "@id"
        },
        "member": {
            "@type": "@id"
        },
        "dataSource": {
            "@type": "@id"
        },
        "sourceSelector": {
            "@type": "@id"
        },
        "annotation": {
            "@type": "@id"
        },
        "renderOption": {
            "@type": "@id"
        }
    }

};