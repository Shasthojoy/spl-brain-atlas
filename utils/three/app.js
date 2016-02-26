if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, controls, scene, renderer;


init();

function init() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1e10 );
    camera.position.z = 300;

    controls = new THREE.TrackballControls( camera );

    controls.rotateSpeed = 5.0;
    controls.zoomSpeed = 5;
    controls.panSpeed = 2;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    scene = new THREE.Scene();

    scene.add( camera );

    // light

    var dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( 200, 200, 1000 ).normalize();

    camera.add( dirLight );
    camera.add( dirLight.target );

    jQuery.ajax({
        dataType: "json",
        url: "../tsvToJson/atlasStructure.json",
        async: true,
        success: dealWithAtlasStructure
    });

    function dealWithAtlasStructure (data) {
        var atlasStructure = data;
        var vtkDatasources = data.filter(function (object) { 
            return object['@type']==='datasource' && /\.vtk$/.test(object.source);
        });
        var vtkDatasourcesId = vtkDatasources.map(source => source["@id"]);
        var vtkStructures = [];
        for(var i=0; i<atlasStructure.length; i++) {
            var item = atlasStructure[i];
            if (item['@type']==='structure') {
                var dataSourceIndex = vtkDatasourcesId.indexOf(item.sourceSelector.dataSource);
                if ( dataSourceIndex> -1) {
                    //item refers to a vtk file
                    item.sourceSelector.dataSourceObject = vtkDatasources[dataSourceIndex];
                    vtkStructures.push(item);
                }
            }
        }


        //Load all the vtk files
        var loader = new THREE.VTKLoader();
        var loadedFile = 0;
        var numberOfFilesToLoad = vtkStructures.length;

        //send the modal a signal to give the number of vtk files to load
        angular.element(document.body).scope().$root.$broadcast('modal.JSONLoaded', numberOfFilesToLoad);

        //this function enables us to create a scope and then keep the right item in the callback
        function loadVTKFile (i) {
            var file = vtkStructures[i].sourceSelector.dataSourceObject.source;
            loader.load( file, function ( geometry ) {

                var item = vtkStructures[i];

                geometry.computeVertexNormals();

                var rgb = item.renderOptions.color.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,?\s*([.0-9]+)?\)$/);
                if (rgb) {
                    rgb = rgb.map(Number);
                }
                else {
                    console.log(JSON.stringify(item,null,4));
                    rgb = [0,0,0,0];
                }

                var material = new THREE.MeshLambertMaterial({
                    wireframe : false, 
                    morphTargets : false, 
                    side : THREE.DoubleSide, 
                    color : rgb[1]*256*256+rgb[2]*256+rgb[3]
                });

                console.log(rgb[1]*256*256+rgb[2]*256+rgb[3]);


                material.opacity = item.renderOptions.opacity || rgb[4] || 1.0;
                material.visible = true;


                if (material.opacity < 1) {
                    material.transparent = true;
                }


                var mesh = new THREE.Mesh( geometry, material );
                item.mesh = mesh;
                loadedFile++;

                //signal to the modal
                angular.element(document.body).scope().$root.$broadcast('modal.fileLoaded');

                if (loadedFile === numberOfFilesToLoad) {
                    //put it in an immediate timeout to give the browser the opportunity to refresh the modal
                    setTimeout(createHierarchy,0);
                }

            });
        }


        for (var i = 0; i<vtkStructures.length; i++) {
            loadVTKFile(i);
        }

        function getTreeObjectFromUuid (uuid) {
            var item = atlasStructure.find(x=>x['@id']===uuid);
            var treeObject = {
                name : item.annotation.name,
                mesh : item.mesh
            };
            if (item['@type']==='group') {
                treeObject.children = item.members.map(getTreeObjectFromUuid).filter(x => x.mesh !== undefined);
                treeObject.mesh = new THREE.Group();
                for (var i = 0; i< treeObject.children.length; i++) {
                    try {
                        treeObject.mesh.add(treeObject.children[i].mesh);
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            }
            return treeObject;
        }

        function createHierarchy () {
            var rootGroups = atlasStructure.filter(x => x['@type']==='group' && x.annotation && x.annotation.root);
            var hierarchyTree = {
                children : rootGroups.map(group => getTreeObjectFromUuid(group['@id']))
            };

            for(var i = 0; i<hierarchyTree.children.length; i++) {
                scene.add(hierarchyTree.children[i].mesh);
            }


            var listContainer = document.getElementById('structureList');
            var treeDirective = document.getElementById('treeListDirective');

            angular.element(document.body).scope().$root.$broadcast('insertTree',hierarchyTree);

            //send a signal to the modal
            angular.element(document.body).scope().$root.$broadcast('modal.hierarchyLoaded', vtkStructures.length);


            console.log('end controller');
        }

        // renderer

        container = document.getElementById('rendererFrame');
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();

        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( container.clientWidth, container.clientHeight );

        container.appendChild( renderer.domElement );

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild( stats.domElement );

        //

        window.addEventListener( 'resize', onWindowResize, false );

        animate();

    }
}

function onWindowResize() {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.clientWidth, container.clientHeight );

    controls.handleResize();

}

function animate() {

    requestAnimationFrame( animate );

    controls.update();
    renderer.render( scene, camera );

    stats.update();

}