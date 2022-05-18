import * as THREE from "three"; 
import TrackballControls from 'three-trackballcontrols';
import COLORSCALE from './colorscale.js';
//import THREE from './three.js';

(function(window)
{
  function web3dm()
  {
    var _web3dmObject = {};

    const SCALE_AXES = 0.001;
    const SCALE_VERT = 10.0;
    const COLOR_LAYER = new THREE.Color(0xffaa00);

    // For debug only
    const COLOR_SURFACE_A = new THREE.Color(0xff0000);
    const COLOR_SURFACE_T = new THREE.Color(0x00ff00);
    const COLOR_SURFACE_B = new THREE.Color(0x0000ff);
    const COLOR_SURFACE_S = new THREE.Color(0xff00ff);
    const COLOR_SURFACE_W = new THREE.Color(0x787878);
    const COLOR_SURFACE_P = new THREE.Color(0xff0000);
    const COLOR_SURFACE_L = new THREE.Color(0xffff00);

    var camControls = null;
    var camera = null;
    var renderer = null;
    var scene = null;
    var model = null;
    var light = null;
    var smoothness = false;
    var pickmode = false;
    var pickdialog = null;
    var parameter = -1;
    var colorScale = null;
    var visperfs = true;
    var vislitos = true;
    var bbox = null;
    var wbox = null;
    var center = null;
    var textLabels = [];
    var pickmarker = null;
    var thisObject = null;

    // By React integration
    var container = null;

    //////////////////////////////////////////////////////////
    //           Изображение модели
    
    var render = function()
    {
        if (textLabels != null)
        {
          for(var i = 0; i < textLabels.length; i++) 
          {
             textLabels[i].updatePosition();
          }
        }
        
        if (pickmarker != null && container != null && container.contains(pickmarker.mainElement))
        {
          pickmarker.updatePosition()
        }

        if (renderer != null)
        {
          requestAnimationFrame(render);
          if (camControls != null)
          {
            camControls.update();
          }
          renderer.render(scene, camera);
        }
    };

    var lightUpdate = function()
    {
      if (center != null)
      {
        var x = camera.position.x - center.x;
        var y = camera.position.y - center.y;
        var z = camera.position.z - center.z;
        light.position.set(x, y, z);
      }
      //cameraHelper.update();
    }

    var onResize = function()
    {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      if (renderer != null)
      {
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    }

    var createRenderer = function(root)
    {
      if (window.innerWidth ==0 || window.innerHeight == 0)
        return;

      if (renderer == null)
      {
        renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, devicePixelRatio: 1.0});
        if (renderer != null)
        {
          console.log("Renderer is OK")
        }
      }
      
      renderer.setClearColor(0xf0f0f0, 1.0);   
      renderer.setSize(window.innerWidth, window.innerHeight);
      console.log("width = "+window.innerWidth + " height ="+window.innerHeight);
      console.log("renderer.domElement = " + renderer.domElement);
      console.log("container = " + container);
     
      if (container != null)
      {
        container.appendChild(renderer.domElement);
      }

      return renderer;
    }
    
    var removeRenderer = function()
    {
      if (renderer != null)
      {
/*
        if (renderer.context != null)
          renderer.context = null;
        if (renderer.domElement != null)
          renderer.domElement = null;
 */       
          renderer = null;
        }
    }

    _web3dmObject.mounted = function()
    {
      return this.mount;
    }    

    _web3dmObject.setContainer = function(_container)
    {
      container = _container;
    }    

    _web3dmObject.CreateCameraControls = function(dir)
    {
      if (dir)
      {
        camControls = new TrackballControls(camera, renderer.domElement);
        camControls.addEventListener('change', lightUpdate); 
      }
      else
      {
        camControls = null;
      }
    }
    
    /////////////////////////////////////////////////////////
    // public methods
    _web3dmObject.init = function(root)
    {

      this.root = root;
      this.mount = false;
      
     /* container = document.getElementById(this.root);
      if (container == null)
      {
        console.log("web3dm: root element is not initialized");
        return false;
      }
      */
      
      console.log("web3dm: initialized");
      // create a scene, that will hold all our elements such as objects, cameras and lights.
      scene = new THREE.Scene();


      // create a camera, which defines where we're looking at.
      camera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 2000);
      if (!renderer)
        renderer = createRenderer(root);
                                               
     
//      window.addEventListener('change', lightUpdate); 
//      window.addEventListener('resize', function() {onResize()});
     // window.addEventListener('mousedown', function(event) {onMouseDown(event)});
     // window.addEventListener('mouseup', function(event) {onMouseUp(event)});
      window.addEventListener('click', function(event) {onMouseClick(event)});
      
      light = new THREE.DirectionalLight();
      light.position.set(0, 1, 0);
      light.intensity = 1.0;
      light.castShadow = true;

      // position and point the camera to the center of the scene
      camera.position.x = 0.0;
      camera.position.y = 1.0;
      camera.position.z = 0.0;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      center = new THREE.Vector3();

      //root.controls = camControls;
      this.setContainer(root.current);
      thisObject = this;
      this.mount = true;
      return true;
     };  //  _web3dmObject.init = function(root)

    ///////////////////////////////////////////////////////////////////////////
    ///                      Загрузка модели

    var initRanges = function()
    {
      bbox = {};
      bbox.xMin = Number.MAX_VALUE;
      bbox.xMax = -Number.MAX_VALUE;
      bbox.yMin = Number.MAX_VALUE;
      bbox.yMax = -Number.MAX_VALUE;
      bbox.zMin = Number.MAX_VALUE;
      bbox.zMax = -Number.MAX_VALUE;

      wbox = {};
      wbox.xMin = Number.MAX_VALUE;
      wbox.xMax = -Number.MAX_VALUE;
      wbox.yMin = Number.MAX_VALUE;
      wbox.yMax = -Number.MAX_VALUE;
      wbox.zMin = Number.MAX_VALUE;
      wbox.zMax = -Number.MAX_VALUE;
    }

    _web3dmObject.loadData = null;
    _web3dmObject.setModel = function(jsonModel, plastId)
    {
      createRenderer();

      console.log("web3dm: model initialized ");
      model = this.createModelStructure(jsonModel);
      if (!model)
      {
        console.log("web3dm: model was  not loaded");
        return;
      }

      initRanges();
      scene.add(light);

      var fileName = null;
      // Загрузка пластов
      if (model.plasts.length > 0)
      {
        var loadAllPlasts = true; 
        if (plastId != null)
        {
          for (var ip = 0; ip < model.plasts.length; ip++)
          {
            var plast = model.plasts[ip];
            if (plast != null && (plast.id === plastId))
            {
              loadAllPlasts = false;
            }
          }  
        }
        
        console.log(loadAllPlasts);
        if (loadAllPlasts)
        {
          this.loadPlast(null, true);
        }
        else
        {
          this.loadPlast(plastId, true);
        }
      }        //  if (loadedModel.plasts.length > 0)

      // this.viewDef();
      
      // Загрузка скважин      
      if (model.gwells.length > 0)
      {
        for (var iw = 0; iw < model.gwells.length; iw++)
        {
          var gwell = model.gwells[iw];
          if (gwell.wells.length > 0)
          {
            for (var iwg = 0; iwg < gwell.wells.length; iwg++)
            {
              var well = gwell.wells[iwg];
              // Формируется имя файла
              var wellName = 'Well_'+ gwell.source + '_'+ well.id;
              fileName = wellName + ".json";
              var _thisWell = this;
              this.loadData(fileName, function(resultData)
              {
                if (_thisWell.addWell(wellName, resultData))
                {
                    render();
                }
              });   //  this.loadData
            }      //  for (var iwg = 0; iwg < wellGroup.wells.length; iwg++)
          }        //  if (wellGroup.wells.length > 0)
        }          //  for (var iw = 0; iw < loadedModel.wells.length; iw++)
      }            //  if (loadedModel.wells.length > 0)
      this.CreateCameraControls(true); //  camControls.enabled = true;
      this.viewDef();
    }; // _web3dmObject.setModel

    _web3dmObject.createModelStructure = function(jsonModel)
    {
      if (jsonModel == null)
      {
        console.log("web3dm: no data in jsonModel");
        return null;
      }

      var json = jsonModel;

      var model = {};
      model.Id = json['modelId'];
      model.displayName = json['displayName'];
      model.shiftX = json['shiftX'];
      model.shiftY = json['shiftY'];

      model.camera = {};
      var jsonCamera = json['camera'];
      if (jsonCamera != null)
      {
        model.camera.directionX = jsonCamera['directionX'];
        model.camera.directionY = jsonCamera['directionY'];
        model.camera.directionZ = jsonCamera['directionZ'];
        model.camera.locationHAngle = jsonCamera['locationHAngle'];
        model.camera.locationVAngle = jsonCamera['locationVAngle'];
        model.camera.locationDistance = jsonCamera['locationDistance'];
      }
      else
      {
        console.log("camera was not read");
      }

      model.bounds = {};
      if (json['bounds'] != null)
      {
        model.bounds.xMin = json['bounds']['xMin'];
        model.bounds.xMax = json['bounds']['xMax'];
        model.bounds.yMin = json['bounds']['yMin'];
        model.bounds.yMax = json['bounds']['yMax'];
        model.bounds.zMin = json['bounds']['zMin'];
        model.bounds.zMax = json['bounds']['zMax'];
      }
      else
      {
        console.log("bounds was not read");
      }
      
      // Группы скважин
      model.gwells = [];
      if (json['wells'] != null)
      {
        var i = 0, iw = 0;
        for (i = 0; i < json['wells'].length; i++)
        {
          var gwell = {};
          gwell.source = json['wells'][i]['source'];
          gwell.wells = [];
          var iwg = 0;
          for (var j = 0; j < json['wells'][i]['items'].length; j++)
          {
            var well = {};
            well.id = json['wells'][i]['items'][j]['id'];
            well.name = json['wells'][i]['items'][j]['name'];

            gwell.wells[iwg] = well;
            iwg++;
          } 

          model.gwells[iw] = gwell;
          iw++; 
        }     //  for (var i in json['wells'])
      }
      else
      {
        console.log("wells was not read");
      }
    
      // Параметры
      model.params = [];
      if (json['params'] != null)
      {        
        var ip = 0;
        for (i = 0; i < json['params'].length; i++)
        {
          var param = {};
          param.id = json['params'][i]['id'];
          if (param.id.indexOf('soil_01011998') != -1)
          {
            console.log("web3dm: parameter was found");
          }
          param.displayName = json['params'][i]['displayName'];
          param.min = json['params'][i]['min'];
          param.max = json['params'][i]['max'];
          model.params[ip] = param;
          ip++;
        }     //  for (var i in json['params'])
      }
      else
      {
        console.log("params was not read");
      }
    
      // Пласты
      model.plasts = [];
      if (json['plasts'])
      {
        for (var ipl = 0; ipl < json['plasts'].length; ipl++)
        {
          var jsonPlast = json['plasts'][ipl];  
          var plast = {};
          plast.id          = jsonPlast['id'];
          plast.displayName = jsonPlast['displayName'];
          plast.layerCount  = jsonPlast['layerCount'];
          plast.plastID = jsonPlast['plastID'];
          plast.plastCode = jsonPlast['plastCode'];
          model.plasts[ipl] = plast;
        }       //  for (var i in json['plasts'])
      }
      else
      {
        console.log("plasts was not read");
      }
    
      return model;
    };    //  _web3dmObject.createModelStructure = function(jsonModel)

    _web3dmObject.loadPlast = function(plastId, removeLayers)
    {
      if (removeLayers)
      {
        for (var i = scene.children.length - 1; i >= 0; i--)
        {
          var child = scene.children[i];
          if (!(child.type === "Mesh"))
            continue;
  
          if (child.name.indexOf('Layer_') != -1)
          {
            if (child.geometry)
            { 
              child.geometry.dispose();
            }

            if(child.material)
            { 
              Object.keys(child.material).forEach (prop => 
              {
                if(child.material[prop] !== null && typeof child.material[prop].dispose === 'function')                                  
                  child.material[prop].dispose();                                                        
              })
            
              child.material.dispose();
            }
            
            scene.remove(child);
          }
        }
      }
      
      var parameterId = -1;
      if (parameter != -1)
      {
        parameterId = parameter;
      }

      if (plastId != null)
      {
        var plastData = null;          
        var plastName = 'Plast_' + plastId;
        var fileName = plastName + ".json";
        var _thisPlast = this;
        this.loadData(fileName, function (resultData)
        {
           plastData = resultData;
          if (plastData != null)
          {
            if (_thisPlast.addPlast(plastData))
            {
              if (parameterId != -1)
                _thisPlast.setPlastParam(plastId, parameterId);

              _thisPlast.viewDef();  
              render();
            }
          }    
        }); 
      }
      else  // Load all plasts
      {
        if ((model != null) && (model.plasts != null) && (model.plasts.length > 0))
        {
          for (var ip = 0; ip < model.plasts.length; ip++)
          {
            var plast = model.plasts[ip];
            if (plast.layerCount > 0)
            {
              var plastData = null;          
              var plastName = 'Plast_' + plast.id;
              var fileName = plastName + ".json";
              var _thisPlast = this;
              this.loadData(fileName, function (resultData)
              {
                plastData = resultData;
                if (plastData != null)
                {
                  if (_thisPlast.addPlast(plastData))
                  {
                    if (parameterId != -1)
                      _thisPlast.setPlastParam(plast.id, parameterId);

                    _thisPlast.viewDef();  
                    render();
                  }
                }    
              }); 
            }    //  if (plast.layerCount > 0)
          }      //  for (var ip = 0; ip < loadedModel.plasts.length; ip++)
        }        //  if (model.plasts.length > 0)
      }
    }

    _web3dmObject.addPlast = function(jsonPlast)
    {
      if (jsonPlast == null)
      {
        console.log("web3dm: geometry can not be created")
        return false;
      }
    
      if (jsonPlast["layers"] == null)
      {
        console.log("web3dm: geometry can not be created")
        return false;
      }

      var plastID = jsonPlast["plast"];
      var namePlast = "Plast_" + plastID + "_";
      var jsonLayers = jsonPlast["layers"];
      var nLayers = jsonLayers.length;
      for (var iLayer = 0; iLayer < nLayers; iLayer++)
      {
        var jsonLayer = jsonLayers[iLayer];
        var layerID = jsonLayer["layer"]; 
        var nameLayer = namePlast + "Layer_" + layerID;
        var layerLevel = (iLayer == 0) ? 'First' : (iLayer == nLayers - 1) ? 'Last' : 'Internal';
        this.addLayer(nameLayer, jsonLayer, layerLevel);        
      }

      return true;
    }    //  _web3dmObject.addPlast = function(namePlast, jsonPlast)
    
    /////////////////////////////////////////////////////////
    _web3dmObject.addLayer = function(nameLayer, jsonLayer, layerLevel)
    {
      if (jsonLayer == null)
      {
        console.log("web3dm: geometry can not be created")
        return false;
      }
    
      if (jsonLayer["surfaces"] == null)
      {
        console.log("web3dm: geometry can not be created")
        return false;
      }

      var geometryArray = [];
      var nSurfs = jsonLayer["surfaces"].length;
      for (var iSurf = 0; iSurf < nSurfs; iSurf++)
      {
        var jsonSurf = jsonLayer["surfaces"][iSurf];
        if (jsonSurf != null)
        {
          var surfaceFlag = jsonSurf['surfaceFlag'];
          if (surfaceFlag == 'T')
          {
            if ((layerLevel == 'Internal') || (layerLevel == 'Last')) 
              continue;
          }            
          else if (surfaceFlag == 'B')
          {
            if ((layerLevel == 'Internal') || (layerLevel == 'First')) 
              continue;
          }            
          
          var geom = this.createSurfaceGeometry(jsonSurf);
          if (geom != null)
          {
            geometryArray.push(geom);
          }
        }          
      }  //  for (var iSurf = 0; iSurf < nSurfs; iSurf++)
      
      if (geometryArray == null || geometryArray.length == 0)
      {
        return false;
      }

      for (var ig = 0; ig < geometryArray.length; ig++)
      {
        var geometry = geometryArray[ig].geometry;
        if (smoothness)
        {
          geometry.computeVertexNormals(true);
        }
        var nameSurface = geometryArray[ig].name;
		
        var mat = new THREE.MeshLambertMaterial
        ({
            color: 0xfcfcfc,     // 255 200 200 200
            side: THREE.FrontSide,
            shading: THREE.SmoothShading
          }
        );

        mat.vertexColors = THREE.NoColors; //THREE.FaceColors;
        var mesh = new THREE.Mesh(geometry, mat);
        mesh.name = nameLayer + nameSurface;
        scene.add(mesh);
      }

      return true;
    };   //   _web3dmObject.addLayer = function(jsonLayer)

    _web3dmObject.hasPlast = function(plastId)
    {
      for (var i = scene.children.length - 1; i >= 0; i--)
      {
        var child = scene.children[i];
        if (!(child.type === "Mesh"))
          continue;
  
        if (child.name.indexOf('Plast_' + plastId) != -1)
        {
          return true;
        }
      }
      
      return false;
    }

    _web3dmObject.removePlast = function(plast)
    {
      this.deletePlast(plast.id);
    }

    _web3dmObject.deletePlast = function(plastId)
    {
      for (var i = scene.children.length - 1; i >= 0; i--)
      {
        var child = scene.children[i];
        if (!(child.type === "Mesh"))
          continue;
  
        if (child.name.indexOf('Plast_' + plastId) != -1)
        {
          if (child.geometry)
          { 
            child.geometry.dispose();
          }

          if(child.material)
          { 
            Object.keys(child.material).forEach (prop => 
            {
              if(child.material[prop] !== null && typeof child.material[prop].dispose === 'function')                                  
                child.material[prop].dispose();                                                        
            })
            
            child.material.dispose();
          }
            
          scene.remove(child);
        }
      }
        
      render();
    };

    _web3dmObject.hasPlastVisibility = function(plastId)
    {
      for (var i = scene.children.length - 1; i >= 0; i--)
      {
        var child = scene.children[i];
        if (!(child.type === "Mesh"))
          continue;
  
        if (child.name.indexOf('Plast_' + plastId) != -1)
        {
          if (child.visible)
            return true;
        }
      }    //  for (var i = scene.children.length - 1; i >= 0; i--)

      return false;
    }

    _web3dmObject.changePlastVisibility = function(plastId, visible)
    {
      for (var i = scene.children.length - 1; i >= 0; i--)
      {
        var child = scene.children[i];
        if (!(child.type === "Mesh"))
          continue;
  
        if (child.name.indexOf('Plast_' + plastId) != -1)
        {
          child.visible = visible;
        }
      }    //  for (var i = scene.children.length - 1; i >= 0; i--)
      
      render();
    };     //  changePlastVisibility function(plastId, visible)

    // For debug only
    var getSurfaceColor = function(surfaceFlag)
    {
      if (surfaceFlag == "A")
      {
        return COLOR_SURFACE_A;
      }
      else if (surfaceFlag == "T")
      {       
        return COLOR_SURFACE_T; 
      }
      else if (surfaceFlag == "B")
      {
        return COLOR_SURFACE_B;
      }
      else if (surfaceFlag == "S")
      {
        return COLOR_SURFACE_S;
      }
      else if (surfaceFlag == "W")
      {
        return COLOR_SURFACE_W;
      }
      else if (surfaceFlag == "P")
      {
        return COLOR_SURFACE_P;
      }
      else if (surfaceFlag == "L")
      {
        return COLOR_SURFACE_L;
      }
      return COLOR_LAYER;
    }    

    /////////////////////////////////////////////////////////
    _web3dmObject.createSurfaceGeometry = function(json)
    {
      if (json == null)
        return null;
      
      var surfaceFlag = json["surfaceFlag"];
      var color = getSurfaceColor(surfaceFlag);
 
      var verticesCount = json["verticesCount"];
      if (verticesCount == null || verticesCount == 0)
        return null;
      var facesCount = json["facesCount"];
      if (facesCount == null || facesCount == 0)
        return null;
      var vertices  = json["vertices"];
      const geom_vertices = [];
      var faces = json["faces"];
      const indices = [];
      var normals = json["normals"];
      const geom_normals = [];
      if (vertices == null || faces == null)
        return null;
      
      if (verticesCount != facesCount * 3)
      {
        smoothness = true;
      }

      var nv = vertices.length;
      if (nv != verticesCount)
        return null;
      var nt = faces.length;
      if (nt != facesCount)
        return null;
     
      var flagLayer = (surfaceFlag == "A" || surfaceFlag == "T" || 
                   surfaceFlag == "B" || surfaceFlag == "S");
      var flagWell = (surfaceFlag == "W");
      
      // Вершины     
      var geometry = new THREE.BufferGeometry();
      
      for (var iv = 0; iv < nv; iv++)
      {
        var x = vertices[iv][0];
        var y = vertices[iv][1];
        var z = vertices[iv][2];
        
        geom_vertices.push(x, y, z);
        
        //var vector = new THREE.Vector3(x, y, z);
        //geometry.vertices.push(vector);

        if (flagLayer)
        {  
          if (x < bbox.xMin)
            bbox.xMin = x;
          if (x > bbox.xMax)
            bbox.xMax = x;

          if (y < bbox.yMin)
            bbox.yMin = y;
          if (y > bbox.yMax)
            bbox.yMax = y;

          if (z < bbox.zMin)
            bbox.zMin = z;
          if (z > bbox.zMax)
            bbox.zMax = z;
        }

        if (flagWell)
        {  
          if (x < wbox.xMin)
            wbox.xMin = x;
          if (x > wbox.xMax)
            wbox.xMax = x;

          if (y < wbox.yMin)
            wbox.yMin = y;
          if (y > wbox.yMax)
            wbox.yMax = y;

          if (z < wbox.zMin)
            wbox.zMin = z;
          if (z > wbox.zMax)
            wbox.zMax = z;
        }
      }

      if (normals == null)
      {
        
      };
      
      // Треугольники     
      for (var it = 0; it < nt; it++)
      {
        var x = normals[it][0];
        var y = normals[it][1];
        var z = normals[it][2];
        
        geom_normals.push(x, y, z);
        indices.push(faces[it][0], faces[it][1], faces[it][2]);
        
        //var face = new THREE.Face3(faces[it][0], faces[it][1], faces[it][2], 
        //                           new THREE.Vector3(x, y, z), color, 0);
        //geometry.faces.push(face);
        geometry.setIndex(indices);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( geom_vertices, 3 ));
      }
      geometry.computeVertexNormals();
      
      var geometryObject = {};
      geometryObject.geometry = geometry;
      geometryObject.name = '_Surface_' + surfaceFlag;
      
      return geometryObject;
    }

    // Замена старой модели новой.
    _web3dmObject.updateModel = function(jsonModel)
    {
      this.clearModel();
      this.setModel(jsonModel);
    };

    var clearThree = function(obj)
    {
      while(obj.children.length > 0)
      { 
        clearThree(obj.children[0]);
        obj.remove(obj.children[0]);
      }
      
      if  (obj.geometry) 
        obj.geometry.dispose();
    
      if(obj.material)
      { 
        //in case of map, bumpMap, normalMap, envMap ...
        Object.keys(obj.material).forEach (prop => 
        {
          if(!obj.material[prop])
            return;         
          if(obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')                                  
            obj.material[prop].dispose();                                                        
        })
        
        obj.material.dispose();
      }
    };   
    
    // Удаление текущей модели
    _web3dmObject.clearModel = function()
    {
      console.log("web3dm: destroyed");
      pickmode = false;

      //var container = document.getElementById(this.root);
      if (container != null)
      {
        if (pickdialog != null)
        {
          container.removeChild(pickdialog.mainElement);
        }

        if (textLabels != null)
        {
          for (var i = 0; i < textLabels.length; i++) 
          {
            var text = textLabels[i];
            container.removeChild(text.element);
          }
          textLabels.length = 0;
        }
        this.CreateCameraControls(false);
        clearThree(scene);
      }    //  if (container != null)

      parameter = -1;
      if (renderer != null)
      {
        container.removeChild(renderer.domElement);
        removeRenderer();
      }
    };

    ///////////////////////////////////////////////////////////////////////////
    ///                        Структура загруженной модели
    
    // Возвращает всю структуру модели: пласты, скважины, параметры
    _web3dmObject.getLayers = function()
    {   
      console.log("web3dm: layers returned");
      if (model == null)
        return null;

      var modelElements = [];
      if (model.plasts.length > 0)
      {
        var group = {};
        group.id = 1;
        group.name = "Геометрия";
        group.visible = false;
        group.plasts = this.getPlasts(false);

        if (group.plasts.length > 0)
        {
          modelElements.push(group);
        }
      }    //   if (model.plasts.length > 0)

      if (model.gwells.length > 0)
      {
        group = {};
        group.id = 2;
        group.name = "Скважины";
        group.visible = false;
        group.gwells = [];
        for (var iwg = 0; iwg < model.gwells.length; iwg++)
        {
          var gwell = {};
          gwell.source = model.gwells[iwg].source;
          gwell.wells = [];
          gwell.visible = false;

          var wellName = 'Well_' + gwell.source;
          // сюда входят и перфорации и литология
          var wellsAll = this.getById(wellName);
          if (wellsAll == null || wellsAll.length == 0)
            continue;

          // Выделяем только скважины
          var wells = [];
          for (iw = wellsAll.length - 1; iw >= 0; iw--)
          {
            var pos = wellsAll[iw].name.indexOf('Perforation');
            if (pos != -1)
              continue;
            pos = wellsAll[iw].name.indexOf('Litology');
            if (pos != -1)
              continue;

            wells.push(wellsAll[iw]);
            wellsAll.splice(iw);    // удаляем элемент из массива
          }

          // Массив wells содержит только скважины,
          // а в массиве wellAll остались перфорации и литология
          if (wells.length > 0)
          {
            for (var iw = 0; iw < wells.length; iw++)
            {
              var well = {};
              well.id = getElementName(wells[iw].name, "Id");
              well.name = getElementName(wells[iw].name, "Name");
              // well.perforations = [];
              // well.litology = [];
              well.visible = wells[iw].visible;

              // Поиск перфораций и пропластков текущей скважины
              for (var iwp = 0; iwp < wellsAll.length; iwp++)
              {
                pos = wellsAll[iwp].name.indexOf(wells[iw].name);
                if (pos == -1)
                  continue;

                pos = wellsAll[iwp].name.indexOf('Perforation');
                if (pos != -1)
                {
                  var perf = {};
                  perf.id = getWellPerforationId(wellsAll[iwp].name);
                  perf.type = getWellPerforationType(wellsAll[iwp].name);
                  perf.date = getWellPerforationDate(wellsAll[iwp].name);
                  perf.visible = wellsAll[iwp].visible;
                  if (well.perforations == undefined)
                  {
                    well.perforations = [];
                  }
                  well.perforations.push(perf);
                }

                pos = wellsAll[iw].name.indexOf('Litology');
                if (pos != -1)
                {
                  var litology = {};
                  litology.id = getWellLitologyId(wellsAll[iwp].name);
                  litology.CollType = getWellLitologyCollType(wellsAll[iwp].name);
                  litology.visible = wellsAll[iwp].visible;
                  if (well.litology == undefined)
                    well.litologt = [];
                  well.litology.push(litology);
                }
              }      //  for (var iwp = 0; iwp < wellsAll.length; iwp++)

              gwell.wells.push(well);
            }
          }

          if (gwell.wells.length > 0)
          {            
            group.gwells.push(gwell);
          }
        }    //  for (iwg = 0; iwg < model.gwells.length; iwg++)

        if (group.gwells.length > 0)
        {
          modelElements.push(group);
        }
      }      //  if (model.gwells.length > 0)

      if (model.params.length > 0)
      {
        group = {};
        group.id = 3;
        group.name = "Параметры";
        group.visible = false;
        group.params = [];
        for (var ip = 0; ip < model.params.length; ip++)
        {
          var param = {};
          param.id = model.params[ip].id;
          param.displayName = model.params[ip].displayName;
          param.min = model.params[ip].min;
          param.max = model.params[ip].max;
          group.params.push(param);
        }
        
        if (group.params.length > 0)
        {
          modelElements.push(group);  
        }
      }

      return modelElements;
    };
    
    // Возвращает информацию о пластах модели
    _web3dmObject.getAllPlastsInfo = function(with_meshes)
    {   
      console.log("web3dm: all plasts returned");
      if (model == null)
        return null;
      if (model.plasts == null)
        return null;
      if (model.plasts.length == 0)
        return null;
        
      return model.plasts;  
    }

    var getPlastDisplayName = function (plastID)
    {
      if (model == null)
        return null;
      if (model.plasts == null)
        return null;
      if (model.plasts.length == 0)
        return null;

      for (var ip = 0; ip < model.plasts.length; ip++)
      {
        if (plastID == model.plasts[ip].id)
        {
          return model.plasts[ip].displayName;
        }
      }
      return null;
    }

    _web3dmObject.getPlastIndex = function(plastId)
    {   
      if ((model == null) || (model.plasts == null) || (model.plasts.length == 0))
        return -1;
      for (var ip = 0; ip < model.plasts.length; ip++)
      {
        if (model.plasts[ip].id == plastId)
        {
          return ip;
        }
      }

      return -1;
    };

    // Возвращает всю структурупласта
    _web3dmObject.getPlast = function(plastId, with_meshes)
    {   
      var ip = this.getPlastIndex(plastId);
      return this.getPlastByIndex(ip, with_meshes);     
    }

    _web3dmObject.getPlastByIndex = function(ip, with_meshes)
    {   
      if (ip == -1)
        return null;

      var plast = {};
      plast.id = model.plasts[ip].id;
      plast.id = model.plasts[ip].id;
      plast.displayName = model.plasts[ip].displayName;
      plast.plastCode = model.plasts[ip].plastCode;
      plast.plastID = model.plasts[ip].plastID;
      plast.visible = false;
      plast.layers = [];
      var plastName = 'Plast_' + plast.id + '_Layer_';

      // Эти слои выделяются из визуализируемой части
      // Надо учитывать, что один слой может быть представлен 3-4 мя mesh
      var meshes = this.getById(plastName);
      if ((meshes == null) || (meshes.length == 0))
        return plast;
        
      var layers = groupById(plastName, meshes);
      if (layers != null && layers.length > 0)
      {
        for (var iLay = 0; iLay < layers.length; iLay++)
        {
          var layer = {};
          layer.id = layers[iLay].id;
          layer.displayName = layers[iLay].displayName + layer.id;
          layer.visible = false;
          if (with_meshes)
          {
            layer.meshes = layers[iLay].meshes;
          }
            
          for (var iMesh = 0; iMesh < layers[iLay].meshes.length; iMesh++)
          {
            if (layers[iLay].meshes[iMesh].visible)
            {
              layer.visible = true;
            }
          }
            
          if (layer.visible)
          {
            plast.visible = true;
          }

          plast.layers.push(layer);
        }
      }
      
      return plast;
    };

    // Возвращает всю структуру модели: пласты, скважины, параметры
    _web3dmObject.getPlasts = function(with_meshes)
    {   
      console.log("web3dm: plasts returned");
      if ((model == null) || (model.plasts == null) || (model.plasts.length == 0))
        return null;

      var plasts = [];
      for (var ip = 0; ip < model.plasts.length; ip++)
      {
        var plast = this.getPlastByIndex(ip, with_meshes);
        if ((plast != null) && (plast.layers != null) && (plast.layers.length > 0))
        {            
          plasts.push(plast);
        }
      }
      
      return plasts;
    };    // _web3dmObject.getPlasts = function()  


    /////////////////////////////////////////////////////////
    _web3dmObject.getById = function(id)
    {
      var meshes = [];
      for (var io = 0; io < scene.children.length; io++)
      {
        var child = scene.children[io];
        if (!(child.type === "Mesh"))
          continue;

        if (child.name.indexOf(id) == -1 || child.name.indexOf(id) != 0)
          continue;
        meshes.push(child);
      }

      return meshes;
    };

    /////////////////////////////////////////////////////////
    // id = 'Plast_' + plast.id + '_Layer_';
    var groupById = function(id, meshes)
    {
      var layers = [];
      var id_length = id.length;
      var io = 0;
      while (io < meshes.length)
      {
        var mesh = meshes[io];
        if (mesh.name.indexOf(id) == -1 || mesh.name.indexOf(id) != 0)
          continue;

        var pos_beg = id_length;
        var pos_end = mesh.name.indexOf('_', pos_beg);
        if (pos_end == -1)
          continue;

        var mesh_id = mesh.name.slice(pos_beg, pos_end);
        var found = false;
        if (layers.length > 0)
        {
          for (var iLay = layers.length - 1; iLay >= 0; iLay--)
          {
            if (layers[iLay].id.indexOf(mesh_id) != -1)
            {
              layers[iLay].meshes.push(mesh);
              found = true;
            }
            break;
          }
        }

        if (!found)
        {
          var layer = {};
          layer.id = mesh_id;
          layer.displayName = id;
          layer.meshes = [];
          layer.meshes.push(mesh);
          layers.push(layer);
        }

        io++;
      }     // while (io < meshed.length)

      return layers;
    };

     // Name of the plast/layer
     var getElementName = function(objName, elementName)
     {
       var pos = objName.indexOf(elementName);
       if (pos == -1)
         return null;
       var pos_Beg = objName.indexOf('_', pos + 1);
       if (pos_Beg == -1)
         return null;
       pos_Beg++;
       var pos_End = objName.indexOf('_', pos_Beg);
       if (pos_End == -1)
         pos_End = objName.length;

       var id = objName.slice(pos_Beg, pos_End);
       return id;
     };

    ///////////////////////////////////////////////////////////////////////////
    ///              Направление взгляда и скорость отображения

    _web3dmObject.viewAll = function()
    {
      var direction = camera.getWorldDirection(new THREE.Vector3(0,0,0));
      direction.normalize();      

      var distance = Math.max(bbox.xMax - bbox.xMin, 
                              bbox.yMax - bbox.yMin, 
                              bbox.zMax - bbox.zMin);
      distance *= 2.0; 

      camera.position.x = -direction.x * distance + center.x;
      camera.position.y = -direction.y * distance + center.y;
      camera.position.z = -direction.z * distance + center.z;

      camera.lookAt(center); 

      camControls.target.set(center.x, center.y, center.z);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      if (renderer != null)
      {
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    }
    
    _web3dmObject.getModelBoundingBox = function(model)
    {
      var bbox={};
      bbox.xMin = Number.MAX_VALUE;
      bbox.xMax = -Number.MAX_VALUE;
      bbox.yMin = Number.MAX_VALUE;
      bbox.yMax = -Number.MAX_VALUE;
      bbox.zMin = Number.MAX_VALUE;
      bbox.zMax = -Number.MAX_VALUE;

      wbox = {};
      wbox.xMin = Number.MAX_VALUE;
      wbox.xMax = -Number.MAX_VALUE;
      wbox.yMin = Number.MAX_VALUE;
      wbox.yMax = -Number.MAX_VALUE;
      wbox.zMin = Number.MAX_VALUE;
      wbox.zMax = -Number.MAX_VALUE;
      
      var meshes = this.getById('Plast_');
      for(var im = 0; im < meshes.length; im++)
      {
        var mesh = meshes[im];
        var mbox = this.getMeshBoundingBox(mesh);
        if (mbox.xMin < bbox.xMin)
            bbox.xMin = mbox.xMin;
        if (mbox.xMax > bbox.xMax)
            bbox.xMax = mbox.xMax;

        if (mbox.yMin < bbox.yMin)
            bbox.yMin = mbox.yMin;
        if (mbox.yMax > bbox.yMax)
            bbox.yMax = mbox.yMax;

        if (mbox.zMin < bbox.zMin)
            bbox.zMin = mbox.zMin;
        if (mbox.zMax > bbox.zMax)
            bbox.zMax = mbox.zMax;
      }  // for(var im = 0 im < meshes.length; im++)
      return bbox;
    }

    _web3dmObject.viewDef = function()
    {
           
      bbox = this.getModelBoundingBox(model);
  
      console.log("x:[" + bbox.xMin +" - " + bbox.xMax+"]");
      console.log("y:[" + bbox.yMin +" - " + bbox.yMax+"]");
      console.log("z:[" + bbox.zMin +" - " + bbox.zMax+"]");

      center.x = (bbox.xMin + bbox.xMax) * 0.5;
      center.y = (bbox.yMin + bbox.yMax) * 0.5;
      center.z = (bbox.zMin + bbox.zMax) * 0.5;
      
      var distance = Math.max(bbox.xMax - bbox.xMin, 
                              bbox.yMax - bbox.yMin, 
                              bbox.zMax - bbox.zMin);
      distance *= 1.2; 

      var pos = positionOnSphere(model.camera.locationHAngle, 
                                 model.camera.locationVAngle,
                                 distance);       
      var dir = camera.getWorldDirection(new THREE.Vector3(0,0,0));                           

      camera.up.set(0, 1, 0); 
  
      camera.position.x = pos[0] + center.x;
      camera.position.y = pos[1] + center.y;
      camera.position.z = pos[2] + center.z;
        
      camera.lookAt(center); 

      camControls.target.set(center.x, center.y, center.z);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      if (renderer != null)
      {
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

    };
   
    // Конвертирование модельных координат в координаты изображение
    var convPointToView = function(coord)
    {
      var view_coord = [];
      view_coord[0] = coord[0] * SCALE_AXES;
      view_coord[1] = coord[2] * SCALE_AXES * SCALE_VERT;
      view_coord[2] = -coord[1] * SCALE_AXES;
      return view_coord;
    };

    // Конвертирование модельных координат в координаты изображение
    var convPointToModel = function(coord)
    {
      var model_coord = new THREE.Vector3;
      model_coord.x = coord.x  / SCALE_AXES;
      model_coord.y = -coord.z / SCALE_AXES;
      model_coord.z = coord.y  / (SCALE_AXES * SCALE_VERT);
      
      return model_coord;
    };

    var positionOnSphere = function (ha, va, r)
    {
      var a = [];

      a[0] = Math.cos(va) * Math.cos(ha);
      a[1] = Math.cos(va) * Math.sin(ha);
      a[2] = Math.sin(va);

      a[0] *= r;
      a[1] *= r;
      a[2] *= r;

      var t = a[1];
      a[1] = a[2];       
      a[2] = -t;

      return a;
    };    
        
    _web3dmObject.changeNavigationSpeed = function(value)
    {
      if (value < 0 || value > 1)
        return;
      var newValue = -0.5 * value + 1.5;
      camControls.dynamicDampingFactor = newValue;
    }

    /////////////////////////////////////////////////////////////////////////////
    /// Wells
  
    _web3dmObject.addWell = function(nameWell, json)
    {
      if (json == null)
        return false;
      
      var jsonWell = json["well"];
      if (jsonWell == null)
        return false;
        
      var wellSource = getWellGroup(nameWell);  
      var wellId = jsonWell["wellId"];
      var wellNumber = jsonWell["wellNumber"];
      var wellGeometry = jsonWell["geometry"];
      var geometryObject = this.createSurfaceGeometry(wellGeometry);
      if (geometryObject == null)
      {
        return false;
      }
      
      var geometry = geometryObject.geometry;
      geometry.computeVertexNormals(true);
      var mat = new THREE.MeshLambertMaterial
      ({
          color: 0xC8C8C8,     // 255 200 200 200
          side: THREE.DoubleSide,
          shading: THREE.SmoothShading
        }
      );

      mat.vertexColors = THREE.FaceColors;
      var mesh = new THREE.Mesh(geometry, mat);
      var nameWellMesh = 
        "Well_Source_" + wellSource + "_Id_" + wellId + "_Name_" + wellNumber; 
      mesh.name = nameWellMesh;
      scene.add(mesh);
      
      // Добавляем название скважины
      var wellName = wellNumber;
      var wellRadius = jsonWell["wellRadius"];
      var wellTrace = jsonWell["trace"];
      if (wellTrace != null)
      {
        var levelsCount = wellTrace["levelsCount"];
        if (levelsCount > 0)
        {
          var inds = [];
          inds.push(0);
          var levelsStep = Math.floor(levelsCount / 4);
          if (levelsStep > 0)
          {
            inds.push(levelsStep);
            inds.push(Math.floor(levelsStep * 2));
            inds.push(Math.floor(levelsStep * 3));
            inds.push(levelsCount - 1);
          }
        
          var levels = wellTrace["levels"];
          var namePositions = [];
          var nameDeltaX = [];
          var nameDeltaY = [];
          for (var i = 0; i < inds.length; i++)
          {
            var ii = inds[i];
            var x = levels[ii][0];
            var y = levels[ii][1];  
            var z = levels[ii][2];
            
            var x1 = (i == 0) ? levels[ii + 1][0] : levels[ii - 1][0];  
            var y1 = (i == 0) ? levels[ii + 1][1] : levels[ii - 1][1];  
            var z1 = (i == 0) ? levels[ii + 1][2] : levels[ii - 1][2];  

            var direction = (i == 0) ? new THREE.Vector3(x1 - x, y1 - y, z1 - z) : 
                                       new THREE.Vector3(x - x1, y - y1, z - z1);
            var position = {};
            position.center = new THREE.Vector3(x, y, z);
            position.circle = getCirclePoints(position.center, direction, wellRadius, 10);

            namePositions.push(position);
            if (i == 0)
            {
              nameDeltaX.push(0);
              nameDeltaY.push(-1);
            }
            else if (i == inds.length - 1)
            {
              nameDeltaX.push(0);
              nameDeltaY.push(1);
            }
            else // if (i == inds.length - 1)
            {
              nameDeltaX.push(1);
              nameDeltaY.push(0);
            }
          }

          var text = createTextLabel();
          text.setHTML(wellName);
          text.setParent(mesh);
          text.setPositions(namePositions);
          text.setDeltaX(nameDeltaX);
          text.setDeltaY(nameDeltaY);
          textLabels.push(text);
          container.appendChild(text.element);
        }   //  if (levelsCount > 0)
      }     //  if (wellTrace != null)

      // Перфорации
      var jsonPerforations = json["perforations"];
      if (jsonPerforations != null)
      {
        var perfCount = jsonPerforations["perfCount"];
        var perfs = jsonPerforations['perfs'];
        if ((perfs != null) && (perfs.length == perfCount))
        {
          for (var iPerf = 0; iPerf < perfCount; iPerf++)
          {
            var jsonPerf = perfs[iPerf];
            var type = jsonPerf['type'];
            var date = jsonPerf['date'];
            var namePerf = nameWellMesh + '_Perforation_' + iPerf + '_' + type + '_' + date;
            var jsonPerfGeometry = jsonPerf["geometry"];
            var objectPerf = this.createSurfaceGeometry(jsonPerfGeometry);
            if (objectPerf == null)
              continue;
            var geometryPerf = objectPerf.geometry;
            geometryPerf.computeVertexNormals(true);

            var matPerf = new THREE.MeshLambertMaterial
            (
              {
                color: 0xFF0000,            // Красный цвет перфорации
                side: THREE.DoubleSide,
                shading: THREE.SmoothShading
              }
            );

            //matPerf.vertexColors = THREE.FaceColors;
            var meshPerf = new THREE.Mesh(geometryPerf, matPerf);
            meshPerf.name = namePerf;
            meshPerf.visible = visperfs;
            scene.add(meshPerf);
          }    //  for (var iPerf = 0; iPerf < nPerfs; iPerf++)
        }      //  if (nPerfs == perfCount)
      }        //  if (jsonPerforations != null) 

      var jsonLitology = json["litology"];
      if (jsonLitology != null)
      {
        var litoCount = jsonLitology["plCount"];
        var litos = jsonLitology["plList"];
        if ((litos != null) && (litos.length == litoCount))
        {
          for (var iLito = 0; iLito < litoCount; iLito++)
          {
            var jsonLito = litos[iLito];
            var collType = jsonLito['collType'];
            var nameLito = nameWellMesh + '_Litology_' + iLito + '_' + collType;
            var jsonLitoGeometry = jsonLito["geometry"];
            var objectLito = this.createSurfaceGeometry(jsonLitoGeometry);
            if (objectLito == null)
              continue;
            var geometryLito = objectLito.geometry;
            geometryLito.computeVertexNormals(true);

            var matLito = new THREE.MeshLambertMaterial
            (
              {
                color: 0xFFFF00,               // желтый
                side: THREE.DoubleSide,
                shading: THREE.SmoothShading
              }
            );

            //matLito.vertexColors = THREE.FaceColors;
            var meshLito = new THREE.Mesh(geometryLito, matLito);
            meshLito.name = nameLito;
            meshLito.visible = vislitos;
            scene.add(meshLito);
          }    // for (var ip = 0; ip < perfCount; ip++)
        }      // if (perfCount > 0)
      }
 
      return true;
    };   //   _web3dmObject.addWell = function(jsonWell)

    var containsInName = function(name)
    {
      if ((scene != null) && (scene.children != null))
      {
        for (var io = 0; io < scene.children.length; io++)
        {
          var child = scene.children[io];
          if (!(child.type === "Mesh"))
            continue;

          if (child.name.indexOf(name) == -1)
            return true;
        }
      }
      return false;
    }

    _web3dmObject.containsPerforation = function()
    {
      return containsInName('Perforation');
    }

    _web3dmObject.containsLitology = function()
    {
      return containsInName('Litology');
    }

    var getWellGroup = function(wellName)
    {
      var pos = wellName.indexOf('Well');
      if (pos == -1)
        return '-1';
      var posId_Beg = wellName.indexOf('_', pos + 1);
      if (posId_Beg == -1)
        return '-1';
      posId_Beg++;
      var posId_End = wellName.indexOf('_', posId_Beg);
      if (posId_End == -1)
        return '-1';
      var id = wellName.slice(posId_Beg, posId_End);
      return id;
    };
   
    var getWellPerforationId = function(wellName)
    {
      var pos = wellName.indexOf('Perforation');
      if (pos == -1)
        return '-1';
      var posId_Beg = wellName.indexOf('_', pos + 1);
      if (posId_Beg == -1)
        return '-1';
      posId_Beg++;
      var posId_End = wellName.indexOf('_', posId_Beg);
      if (posId_End == -1)
        return '-1';
      var id = wellName.slice(posId_Beg, posId_End);
      return id;
    };
   
    var getWellPerforationType = function(wellName)
    {
      var pos = wellName.indexOf('Perforation');
      if (pos == -1)
        return '-1';
      var posId = wellName.indexOf('_', pos + 1);
      if (posId == -1)
        return '-1';
      posId++;
      var posType_Beg = wellName.indexOf('_', posId);
      if (posType_Beg == -1)
        return '-1';
      posType_Beg++;
      var posType_End = wellName.indexOf('_', posType_Beg);
      if (posType_End == -1)
      {
        return wellName.slice(posType_Beg);        
      }
      var type = wellName.slice(posType_Beg, posType_End);
      return type;
    };
   
    var getWellPerforationDate = function(wellName)
    {
      var pos = wellName.indexOf('Perforation');
      if (pos == -1)
        return '-1';
      var posDate = wellName.lastIndexOf('_');
      if (posDate == -1)
        return '-1';
      var date= wellName.slice(posDate + 1);
      return date;
    };
   
    var getWellLitologyId = function(wellName)
    {
      var pos = wellName.indexOf('Litology');
      if (pos == -1)
        return '-1';
      var posId_Beg = wellName.indexOf('_', pos + 1);
      if (posId_Beg == -1)
        return '-1';
      posId_Beg++;
      var posId_End = wellName.indexOf('_', posId_Beg);
      if (posId_End == -1)
      {
        return wellName.slice(posId_Beg);        
      }
      var id = wellName.slice(posId_Beg, posId_End);
      return id;
    };
   
    var getWellLitologyCollType = function(wellName)
    {
      var pos = wellName.indexOf('Litology');
      if (pos == -1)
        return '-1';
      var posCollType = wellName.lastIndexOf('_');
      if (posCollType == -1)
        return '-1';
      var collType= wellName.slice(posCollType + 1);
      return collType;
    };
    
    _web3dmObject.setViewPerfs = function(_visperfs)
    {
      visperfs = _visperfs;
    }

  
    _web3dmObject.areViewPerfs = function()
    {
      return visperfs;
    }

    _web3dmObject.viewPerfs = function(visible)
    {
      visperfs = visible;
      for (var io = 0; io < scene.children.length; io++)
      {
        var child = scene.children[io];
        if (!(child.type === "Mesh"))
          continue;

        if (child.name.indexOf('Perforation') == -1)
          continue;

        child.visible = visible;
      }
    }

    _web3dmObject.setViewLitos = function(_vislitos)
    {
      vislitos = _vislitos;
    }

    _web3dmObject.areViewLitos = function()
    {
      return vislitos;
    }

    _web3dmObject.viewLitos = function(visible)
    {
      vislitos = visible;
      for (var io = 0; io < scene.children.length; io++)
      {
        var child = scene.children[io];
        if (!(child.type === "Mesh"))
          continue;

        if (child.name.indexOf('Litology') == -1)
          continue;

        child.visible = visible;
      }
    }

    /////////////////////////////////////////////////////////////////////////////
    /// Parameters
      
    // Переключения видимости параметра
    _web3dmObject.setPlastParam = function(plastId, paramId)
    {
      // Parameter must be visualized
      if (paramId == undefined)
      {  
        console.log("web3dm: parameter ID was not defined");
        return;
      }
      
      var param = null;
      for (var i = 0; i < model.params.length; i++)
      {
        if (paramId == model.params[i].id)
        {
          param = model.params[i];
          break;
        }
      }

      if (param == null)
      {
        console.log("web3dm: parameter ID was not found");
        return;
      }
      
      var paramMin = parseFloat(param.min);
      var paramMax = parseFloat(param.max);
      colorScale = COLORSCALE.Create(paramMin, paramMax, 9);
      var baseName = paramId + "\\Parameter_" + paramId + "_Plast_";

      var plast = this.getPlast(plastId, true);
      if (plast == null)
      {
        console.log("web3dm: plast was not found");
        return;
      }

      var fileName = baseName + plast.id + ".json";
      this.loadData(fileName, function(resultData, plast)
      {
        var jsonLayers = resultData["layers"];
        var jsonBinding = resultData["paramBinding"];

        var layers = plast.layers;
        if (layers == null || layers.length == 0)
          return;
          
        for (var iLay = 0; iLay < layers.length; iLay++)
        {
          var layer = layers[iLay];
          if (layer == null || layer.meshes.length == 0)
            continue;
            
          var jsonLayerId = null;  
          var jsonLayer = null;
          for (var iL = 0; iL < jsonLayers.length; iL++)
          {
            jsonLayerId = jsonLayers[iL]["layer"];
            if (jsonLayerId == layer.id)
            {
              jsonLayer = jsonLayers[iL];
              break;
            }				  
          }

          if (jsonLayer == null)
            continue;
		  
          var paramValuesCount_A = 0;
          var paramValues_A = null;
          var paramValuesCount_T = 0;
          var paramValues_T = null;
          var paramValuesCount_B = 0;
          var paramValues_B = null;
          var paramValuesCount_S = 0;
          var paramValues_S = null;
            
          var jsonSurface = jsonLayer['paramSurface'];
          if (jsonSurface != null && jsonSurface.length > 0)
          {
            for (var js = 0; js < jsonSurface.length; js++)
            {
              var json = jsonSurface[js];
              //if (json == null)  // was error
              //  continue;  
                
              var flag = json['surfaceFlag'];
              if (flag == 'A')
              {
                paramValuesCount_A = json['paramValuesCount']
                if (paramValuesCount_A != null && paramValuesCount_A > 0)
                {
                  paramValues_A = Float32Array.from(json['paramValues']);
                }
              }
              else if (flag == 'T')
              {
                paramValuesCount_T = json['paramValuesCount']
                if (paramValuesCount_T != null && paramValuesCount_T > 0)
                {
                  paramValues_T = Float32Array.from(json['paramValues']);
                }
              }
              else if (flag == 'B')
              {
                paramValuesCount_B = json['paramValuesCount']
                if (paramValuesCount_B != null && paramValuesCount_B > 0)
                {
                  paramValues_B = Float32Array.from(json['paramValues']);
                }
              }
              else if (flag == 'S')
              {
                paramValuesCount_S = json['paramValuesCount']
                if (paramValuesCount_S != null && paramValuesCount_S > 0)
                {
                  paramValues_S = Float32Array.from(json['paramValues']);
                }
              }
            }    //  for (var js = 0; js < jsonSurface.length; js++)
          }      //  if (jsonSurface != null && jsonSurface.length > 0) 
            
          if (paramValuesCount_A > 0 || paramValuesCount_T > 0 || 
              paramValuesCount_B > 0 || paramValuesCount_S > 0)
          {
            for (var i = 0; i < layer.meshes.length; i++)
            {
              var valuesCount = 0;
              var values = [];                
              if (layer.meshes[i].name.indexOf('_Surface_A') != -1)
              {
                valuesCount = paramValuesCount_A;
                values = paramValues_A;                  
              }                  
              else if (layer.meshes[i].name.indexOf('_Surface_T') != -1)
              {
                valuesCount = paramValuesCount_T;
                values = paramValues_T;                  
              }
              else if (layer.meshes[i].name.indexOf('_Surface_B') != -1)
              {
                valuesCount = paramValuesCount_B;
                values = paramValues_B;                  
              }
              else if (layer.meshes[i].name.indexOf('_Surface_S') != -1)
              {
                valuesCount = paramValuesCount_S;
                values = paramValues_S;                  
              }
                
              if (valuesCount > 0)
              {
                // Данные для непосредственного использования 
                setMeshParameter(layer.meshes[i], jsonBinding, valuesCount, values); 
              }   //  if (valuesCount > 0)
            }     //  for (var i = 0; i < layer.meshes.length; i++) 
          }       //  if (paramValuesCount_A > 0 ||
              
          paramValues_A = null;
          paramValues_T = null;
          paramValues_B = null;
          paramValues_S = null;
              
          layer.meshes = null;
          layer = null;
        }        //  for (var iLay = 0; iLay < layers.length; iLay++)             
              
        removePlastMeshes(plast);
        resultData = null;
        plast = null; 
      }, plast);      
    };   //  _web3dmObject.setPlastParam


    // Переключения видимости параметра
    _web3dmObject.changeParamVisibility = function(parameterId, visibility)
    {
      if (!visibility)
      {
        var layerMeshes = this.getById('Plast_');
        for (var iLay = 0; iLay < layerMeshes.length; iLay++)
        {
          var mesh = layerMeshes[iLay];
          mesh.material.vertexColors = THREE.NoColors;
          mesh.material.needsUpdate = true;
          mesh.geometry.colorsNeedUpdate = true;
        }
        
        // Удаление параметра
        parameter = -1;;
        render();
        return;
      } 

      if (parameterId == undefined)
      {  
        console.log("web3dm: parameter ID was not defined");
        return;
      }
      
      var param = null;
      for (var i = 0; i < model.params.length; i++)
      {
        if (parameterId == model.params[i].id)
        {
          param = model.params[i];
          break;
        }
      }

      if (param == null)
      {
        console.log("web3dm: parameter ID was not found");
        return;
      }
      
      var paramMin = parseFloat(param.min);
      var paramMax = parseFloat(param.max);
      colorScale = COLORSCALE.CreateScale(paramMin, paramMax, 9);
      var baseName = parameterId + "/Parameter_" + parameterId + "_Plast_";

      var plasts = this.getPlasts(true);
      if (plasts == null || plasts.length == 0)
      {
        console.log("web3dm: layers were were not found");
        return;
      }

      for (var ip = 0; ip < plasts.length; ip++)
      {
        var plast = plasts[ip];
        if (plast == null)
          continue;
        
        var fileName = baseName + plast.id + ".json";
        this.loadData(fileName, function(resultData, plast)
        {
          if (resultData == null)
            return;

          var jsonLayers = resultData["layers"];
          var jsonBinding = resultData["paramBinding"];
          
          var layers = plast.layers;
          if (layers == null || layers.length == 0)
            return;
          
          for (var iLay = 0; iLay < layers.length; iLay++)
          {
            var layer = layers[iLay];
            if (layer == null || layer.meshes.length == 0)
              continue;
            
            var jsonLayerId = null;  
            var jsonLayer = null;
            for (var iL = 0; iL < jsonLayers.length; iL++)
            {
              jsonLayerId = jsonLayers[iL]["layer"];
              if (jsonLayerId == layer.id)
              {
                jsonLayer = jsonLayers[iL];
                break;
              }				  
            }

            if (jsonLayer == null)
              continue;
		  
            var paramValuesCount_A = 0;
            var paramValues_A = null;
            var paramValuesCount_T = 0;
            var paramValues_T = null;
            var paramValuesCount_B = 0;
            var paramValues_B = null;
            var paramValuesCount_S = 0;
            var paramValues_S = null;
            
            var jsonSurface = jsonLayer['paramSurface'];
            if (jsonSurface != null && jsonSurface.length > 0)
            {
              for (var js = 0; js < jsonSurface.length; js++)
              {
                var json = jsonSurface[js];
                //if (json == null)  // was error
                //  continue;  
                
                var flag = json['surfaceFlag'];
                if (flag == 'A')
                {
                  paramValuesCount_A = json['paramValuesCount']
                  if (paramValuesCount_A != null && paramValuesCount_A > 0)
                  {
                    paramValues_A = Float32Array.from(json['paramValues']);
                  }
                }
                else if (flag == 'T')
                {
                  paramValuesCount_T = json['paramValuesCount']
                  if (paramValuesCount_T != null && paramValuesCount_T > 0)
                  {
                    paramValues_T = Float32Array.from(json['paramValues']);
                  }
                }
                else if (flag == 'B')
                {
                  paramValuesCount_B = json['paramValuesCount']
                  if (paramValuesCount_B != null && paramValuesCount_B > 0)
                  {
                    paramValues_B = Float32Array.from(json['paramValues']);
                  }
                }
                else if (flag == 'S')
                {
                  paramValuesCount_S = json['paramValuesCount']
                  if (paramValuesCount_S != null && paramValuesCount_S > 0)
                  {
                    paramValues_S = Float32Array.from(json['paramValues']);
                  }
                }
              }    //  for (var js = 0; js < jsonSurface.length; js++)
            }      //  if (jsonSurface != null && jsonSurface.length > 0) 
            
            if (paramValuesCount_A > 0 || paramValuesCount_T > 0 || 
                paramValuesCount_B > 0 || paramValuesCount_S > 0)
            {
              for (var i = 0; i < layer.meshes.length; i++)
              {
                var valuesCount = 0;
                var values = [];                
                if (layer.meshes[i].name.indexOf('_Surface_A') != -1)
                {
                  valuesCount = paramValuesCount_A;
                  values = paramValues_A;                  
                }                  
                else if (layer.meshes[i].name.indexOf('_Surface_T') != -1)
                {
                  valuesCount = paramValuesCount_T;
                  values = paramValues_T;                  
                }
                else if (layer.meshes[i].name.indexOf('_Surface_B') != -1)
                {
                  valuesCount = paramValuesCount_B;
                  values = paramValues_B;                  
                }
                else if (layer.meshes[i].name.indexOf('_Surface_S') != -1)
                {
                  valuesCount = paramValuesCount_S;
                  values = paramValues_S;                  
                }
                
                if (valuesCount > 0)
                {
                  // Данные для непосредственного использования 
                  setMeshParameter(layer.meshes[i], jsonBinding, valuesCount, values); 
                  parameter = parameterId
                }   //  if (valuesCount > 0)
              }     //  for (var i = 0; i < layer.meshes.length; i++) 
            }       //  if (paramValuesCount_A > 0 ||
              
            paramValues_A = null;
            paramValues_T = null;
            paramValues_B = null;
            paramValues_S = null;
              
            layer.meshes = null;
            layer = null;
          }        //  for (var iLay = 0; iLay < layers.length; iLay++)             

          removePlastMeshes(plast);
          plast = null; 
          resultData = null;
          render();
        }, plast);      
      }          //  for (var ip = 0; ip < plasts.length; ip++) 
      
      plasts = null;  
      // scale = null;
    };             //  _web3dmObject.changeParamVisibility
    
    /////////////////////////////////////////////////////////
    var setMeshParameter = function(mesh, binding, valuesCount, values)
    {
      if (mesh == null)
        return;
      
      if (colorScale == null)
        return;  

      if (values == null || valuesCount == 0)
        return;

      if (smoothness)
      {
        if (binding == "faces")
        {
          const nvertices =  mesh.geometry.attributes.position.count;
          let verticesValues = new Float32Array(nvertices);
          let verticesAreas = new  Float32Array(nvertices);
          const positions = mesh.geometry.attributes.position.array;
          const indexes = mesh.geometry.getIndex().array;
          let colors = new Float32Array(nvertices * 3);
          if (indexes.length != valuesCount * 3)
          {
            console.error("Number of parameter's faces values is not equal real number of faces");
            if (indexes.length < valuesCount * 3)
               return;
          }
     

          let idx = 0
          for(var ii = 0; ii < valuesCount; ii += 3) 
          {
            const iv1 = indexes[idx + 0];
            const iv2 = indexes[idx + 1];
            const iv3 = indexes[idx + 2];
            
            const v1 = new THREE.Vector3(); 
            v1.fromArray(positions, iv1 * 3);
            const v2 =  new THREE.Vector3(); 
            v2.fromArray(positions, iv2 * 3);
            const v3 =  new THREE.Vector3(); 
            v3.fromArray(positions, iv3 * 3);

            var faceTriangle = new THREE.Triangle(v1, v2, v3);
            var faceArea = faceTriangle.getArea();
            
            verticesValues[iv1] += (values[ii] * faceArea);   
            verticesAreas[iv1] += faceArea;

            verticesValues[iv2] += (values[ii] * faceArea);   
            verticesAreas[iv2] += faceArea;

            verticesValues[iv3] += (values[ii] * faceArea);
            verticesAreas[iv3] += faceArea;

            idx +=3;
          }  // for(var ii = 0; ii < valuesCount; ii += 3)
          
          values = new Float32Array(nvertices);
          let ic = 0
          for (var iv = 0; iv < nvertices; iv++)
          {
             values[iv] = 0.0;
             if (verticesAreas[iv] > 0.000001)
             {
               values[iv] =  verticesValues[iv] / verticesAreas[iv];
             } 
             var ca = colorScale.GetColor(values[iv]);
             //var color = new THREE.Color(ca.r / 255, ca.g / 255, ca.b / 255);
             colors[ic + 0] = ca.r / 255;
             colors[ic + 1] = ca.g / 255;
             colors[ic + 2] = ca.b / 255;
             ic += 3;
          }
          mesh.geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) )
          valuesCount = nvertices;  
          verticesAreas = null;
          verticesValues = null;
        }  // if (binding == "faces")
        else if (binding == "vertices")
        {
          const nvertices =  mesh.geometry.attributes.position.count;
          if (nvertices != valuesCount)
          {
            console.error("Number of parameter's vertices values is not equal real number of vertices");
            if (nvertices > valuesCount)
            {
              return;
            }
          }
          let colors = new Float32Array(nvertices * 3);
          let ic = 0;
          for (var iv = 0; iv < nvertices; iv++)
          {
            var ca = colorScale.GetColor(values[iv]);
            colors[ic + 0] = ca.r / 255;
            colors[ic + 1] = ca.g / 255;
            colors[ic + 2] = ca.b / 255;
            ic += 3;
          }
          mesh.geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) )
        }
        
        mesh.material.vertexColors = THREE.VertexColors;
      }     
      else  // else: if (this.smoothness)
      {
        if (binding == "vertices")
        {
          var nfaces =  mesh.geometry.faces.length;
          var facesValues = new Float32Array(nfaces);
          for (var ii = 0; ii < nfaces; ii++)
          {
            var i1 = mesh.geometry.faces[ii].a;
            var i2 = mesh.geometry.faces[ii].b;
            var i3 = mesh.geometry.faces[ii].c;

            var valueA = values[i1];
            var valueB = values[i2];
            var valueC = values[i3];
            var faceValue = (valueA + valueB + valueC) / 3;
            facesValues[ii] = faceValue;
          }   
          
          values = facesValues;
          valuesCount = nfaces;  
        }      // if (jsonBinding == "vertices")

        mesh.material.vertexColors = true;
        let nv = mesh.geometry.attributes.position.count;
        for (var ii = 0 ; ii < valuesCount; ii++)
        {
          var value = values[ii];
          var rgb = colorScale.GetColor(value);
          var color = new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255);
          mesh.geometry.faces[ii].color = color;
        }
      }      //  ilse: if (this.smoothness)

      values = null;
      // layer.meshes[i].geometry.elementsNeedUpdate = true;
      mesh.material.needsUpdate = true;
      mesh.geometry.colorsNeedUpdate = true;
    }   //  function: setMeshParameter

    /////////////////////////////////////////////////////////
    var removePlastMeshes = function(plast)
    {
      if (plast == null)
        return;
      if (plast.layers == null ||plast.layers.length == 0)
        return;
        
      for (var iLay = 0; iLay < plast.layers.length; iLay++)
      {
        if (plast.layers[iLay] == null || plast.layers[iLay].meshes == null)
          continue;

        if (plast.layers[iLay].meshes.length == 0)
          continue;

        for (var i = 0; i< plast.layers[iLay].meshes.length; i++)
        {
          plast.layers[iLay].meshes[i] = null;
        }   

        plast.layers[iLay] = null;
      }
   }

    /////////////////////////////////////////////////////////////////////////////
    /// Pick data

    var onMouseClick = function(event)
    {

      if (!pickmode)
        return; 
      

      var pickedObject = getPickedObject(event);
      if (pickdialog == null)
      {
        pickdialog = createMessageDialog();
      }      
      
      if (pickmarker == null)
      {
        pickmarker = createPickMarker();
      }
      
      if (!pickdialog.getBlock())
      {
        if ((pickmarker != null) && (container != null))
        {
          if (pickedObject != null)
          {
            pickmarker.setPosition(pickedObject.point);
            if (!container.contains(pickmarker.mainElement))
            {
              container.appendChild(pickmarker.mainElement);
            }
          }
          else
          {
            if (container.contains(pickmarker.mainElement))
            {
              container.removeChild(pickmarker.mainElement);
            }
          }
        }

        createPickedMessages(pickedObject, pickdialog);
      
        pickdialog.applyMessages();
        pickdialog.setPosition(event.clientX, event.clientY);
        pickdialog.setVisible(true);
      }  // if (!pickdialog.getBlock())
   }
    
    _web3dmObject.isPickMode = function()
    {
       return pickmode;
    }

    _web3dmObject.pickMode = function(_pickmode)
    {
      if (pickmode != _pickmode)
      {
        pickmode = _pickmode;
        if (!pickmode)
        {
          if (pickdialog != null)
          {
            pickdialog.setVisible(false); 
          }
        }
        else
        {
          pickdialog = createMessageDialog();
        }
      }
      if (pickmode)
      {
        document.body.style.cursor = 'pointer';
      }
      else
      {
        document.body.style.cursor = 'default';
      }
    }

    var calculateShift = function()
    {
      var shift = {};
      shift.x = 0;
      shift.y = 0;
      if (renderer != null && renderer.domElement != null)
      {
         if (renderer.domElement.offsetParent.clientHeight < window.innerHeight)
         {
           shift.y += (window.innerHeight - renderer.domElement.offsetParent.clientHeight);
         }
         else
         {
          shift.y += renderer.domElement.offsetTop;
         }

         if (renderer.domElement.offsetParent.clientWidth < window.innerWidth)
         {
           shift.x += (window.innerWidth - renderer.domElement.offsetParent.clientWidth);
         }
         else
         {
          shift.x += renderer.domElement.offsetLeft;
         }
      }

      return shift;
    }

    var getPickedObject = function(event)
    {
      var shift = calculateShift();
      var x = ((event.clientX - shift.x) / window.innerWidth) * 2 - 1;
      var y = - ((event.clientY - shift.y) / window.innerHeight) * 2 + 1;
      var raycaster = new THREE.Raycaster();
      
      // raycaster.setFromCamera();
      raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);
      raycaster.ray.direction.set(x, y, 0.5).unproject(camera).sub(raycaster.ray.origin).normalize();
    
      var intersects = raycaster.intersectObjects(scene.children);
  
      if (intersects != null)
      {
        if (intersects.length > 0)
        {
          return intersects[0];
        } 
      }
  
      return null;
    }

    var getParameterJsonData = function(json, layer, surface, face, faceIndex)
    {
      if (json != null)
      {
        var data = {};
        data.binding = json.paramBinding;
        if (data.binding != null)
        {
          if (json.layers != null)
          {
            var jsonLayer = null;
            for (var iLay = 0; iLay < json.layers.length; iLay++)
            {
              if (json.layers[iLay].layer == layer)
              {
                jsonLayer = json.layers[iLay];
                break;
              }
            }
            
            if (jsonLayer != null)
            {
              if (jsonLayer.paramSurface != null)
              {
                var jsonSurfaces = jsonLayer.paramSurface;
                if (jsonSurfaces.length > 0)
                {
                  for (var i = 0; i < jsonSurfaces.length; i++)
                  {
                    var jsonSurface = jsonSurfaces[i];
                    if (jsonSurface.surfaceFlag == surface)
                    {
                       var paramValues = jsonSurface.paramValues;
                       var paramValuesCount = jsonSurface.paramValuesCount;
                       if (data.binding == "vertices")
                       {
                         data.values = [];
                         if (face.a >= 0 && face.a < paramValuesCount)
                         {
                          data.values.push(paramValues[face.a]);
                         }
                         if (face.b >= 0 && face.b < paramValuesCount)
                         {
                          data.values.push(paramValues[face.b]);
                         }
                         if (face.c >= 0 && face.c < paramValuesCount)
                         {
                          data.values.push(paramValues[face.c]);
                         }
                         return data;
                       }
                       else // (data.binding == "faces")
                       {
                         if (faceIndex >= 0 && faceIndex < paramValuesCount)
                         {
                           data.value = paramValues[faceIndex];
                           return data; 
                         }
                       }
                    }
                  }
                }
              }
            }
          }
        }
      }

       return null;
    }
  
    var createPickedMessages = function(pickedObject, msgdialog)
    {
      if (msgdialog == null)
        return;

      msgdialog.setStatus(true);  
      msgdialog.clearMessages();

      msgdialog.addMessage("Значение поля"); 
      if (pickedObject == null)
      {
        msgdialog.addMessage("Курсор мыши вне модели"); 
        msgdialog.setStatus(false);
        return;
      }

      var pickedMesh = pickedObject.object;
      if (pickedMesh == null || pickedMesh.name == null)
      {
        msgdialog.addMessage("Объект не определен");
        msgdialog.setStatus(false);
        return;
      }

      var pickedPoint = pickedObject.point; 
      if (pickedPoint == null)
      {
        msgdialog.addMessage("Не определена точка на объекте"); 
        msgdialog.setStatus(false);
        return;
      }

      var namePickedMesh = pickedMesh.name; 
      var plastName = getElementName(namePickedMesh, 'Plast');
      if (plastName == null)
      {
        // Проверка на скважину и выход
        if (namePickedMesh.indexOf('Well') != -1)
        {
          msgdialog.addMessage("Скважина:");
          var wellId = getElementName(namePickedMesh, "Id");
          var wellName = getElementName(namePickedMesh, "Name");
          msgdialog.addMessage(wellId + " / " + wellName);
          if (namePickedMesh.indexOf('Perforation') != -1)
          {
            var n = msgdialog.countMessages(); 
            var msg = msgdialog.getMessage(n - 1);
            var new_msg = msg + " (Перфорация)"; 
            msgdialog.setMessage(n - 1, new_msg);
          }
          else 
          if (namePickedMesh.indexOf('Litology') != -1)
          {
            var n = msgdialog.countMessages(); 
            var msg = msgdialog.getMessage(n - 1);
            var new_msg = msg + " (Пропласток)";
            msgdialog.setMessage(n - 1, new_msg);
          }
        }
        else
        {
          msgdialog.addMessage("Пласт не определен"); 
          msgdialog.setStatus(false);
          return;
        }
      }
      else  // if (plastName == null)
      {   
        if (parameter != -1)
        {
          var param = null;
          for (var i = 0; i < model.params.length; i++)
          {
            if (parameter == model.params[i].id)
            {
              param = model.params[i];
              break;
            }
          }
    
          if (param == null)
          {
            console.log("web3dm: parameter ID was not found");
            return;
          }
        
          msgdialog.addMessage("Параметр: " + param.displayName);
          var rangeMessage = " [" + param.min + " : " + param.max + "]";
          var baseName = parameter + "\\Parameter_" + parameter + "_Plast_" + plastName;
          var fileName = baseName + ".json";
          
          var paramMin = parseFloat(param.min);
          var paramMax = parseFloat(param.max);

          var messageParam = null;
          var messagePosition = msgdialog.countMessages();
          msgdialog.setBlock(true);
          thisObject.loadData(fileName, function(resultData)
          {
            var face = pickedObject.face;
            var faceIndex = pickedObject.faceIndex;
            var layerName = getElementName(namePickedMesh, 'Layer');
            var surfaceFlag = getElementName(namePickedMesh, 'Surface');
            var data = getParameterJsonData(resultData, layerName, surfaceFlag, face, faceIndex);
            if (data != null)
            {
              var dataValue = 0.0; 
              if (data.binding == "faces")
              {
                dataValue = data.value;
              }
              else
              {
                // Значение параметра в вершинах
                var valueA = data.values[0];
                var valueB = data.values[1];
                var valueC = data.values[2];
                // Координаты вершин
                var a = pickedMesh.geometry.vertices[face.a];
                var b = pickedMesh.geometry.vertices[face.b];
                var c = pickedMesh.geometry.vertices[face.c];
                var bari = THREE.Triangle.barycoordFromPoint(pickedPoint, a, b, c);
                var dataValue = valueA * bari.x + valueB * bari.y + valueC * bari.z; 
              }
    
              if (dataValue < paramMin)
                dataValue = paramMin;
              if (dataValue > paramMax)
                dataValue = paramMax;
        
              var valueMessage = "Значение: " + dataValue.toFixed(5); 
              messageParam = valueMessage + rangeMessage;
            }
            else
            {
              messageParam = "Значение параметра не найдено";
            }

            if (messageParam != null)
            {
              if (msgdialog != null)
              {
                msgdialog.updateMessage(messagePosition, messageParam);
              }
            }
            
            msgdialog.setBlock(false);
          });
        }

        if (messageParam == null)
        {
          msgdialog.addMessage("Ожидайте...");
        }

        var plastDisplayName = getPlastDisplayName(plastName); 
        var msg = "Пласт: ";
        msg += (plastDisplayName != null) ? plastDisplayName : plastName;
        msg += " / Слой: " + getElementName(namePickedMesh, 'Layer');
        msgdialog.addMessage(msg);
      }     // else : if (plastName == null)

      msgdialog.addMessage(null);
      msgdialog.addMessage("Координаты указателя!");
  
      var point = convPointToModel(pickedPoint);
  
      var x = point.x;
      var y = point.y;
      var z = point.z;
  
      if ((model != null) && (model.shiftX != null) && (model.shiftY != null))
      {
          x += model.shiftX;
          y += model.shiftY;      
      } 

      msgdialog.addMessage("x:   " + x.toFixed(4));
      msgdialog.addMessage("y:   " + y.toFixed(4));
      msgdialog.addMessage("z:   " + z.toFixed(4));
      msgdialog.setStatus(false);
    }
  
    /////////////////////////////////////////////////////////////////////////////
    //                    ounding box
    _web3dmObject.getMeshBoundingBox = function(mesh)
    {
      mesh.geometry.computeBoundingBox();
      const minBox = mesh.geometry.boundingBox.min;
      const maxBox = mesh.geometry.boundingBox.max;
      var bbox={};
      bbox.xMin = minBox.x;
      bbox.xMax = maxBox.x;
      bbox.yMin = minBox.y;
      bbox.yMax = maxBox.y;
      bbox.zMin = minBox.z;
      bbox.zMax = maxBox.z;
    
      wbox = {};
      wbox.xMin = minBox.x;
      wbox.xMax = maxBox.x;
      wbox.yMin = minBox.y;
      wbox.yMax = maxBox.y;
      wbox.zMin = minBox.z;
      wbox.zMax = maxBox.z;
        
      return bbox;
    }

    
    /////////////////////////////////////////////////////////////////////////////
    ///                             Smooth
    
    var SmoothMode = function()
    {
      return smoothness;
    }

    _web3dmObject.smoothMode = function(_smoothness)
    {
      if (smoothness != _smoothness)
      { 
        smoothness = _smoothness;
        for (var io = 0; io < scene.children.length; io++)
        {
          var child = scene.children[io];
          if (!(child.type === "Mesh"))
            continue;

          if (child.name.indexOf('Plast') == -1)
            continue;

          if (smoothness)
          {
            child.geometry.computeVertexNormals(true);
          }
          else
          {
            // Удалить нормали в вершинах
            for (var i = 0; i < child.geometry.faces.length; i++)
            {
              var face = child.geometry.faces[i];
              face.vertexNormals[0].copy(face.normal);
              face.vertexNormals[1].copy(face.normal);
              face.vertexNormals[2].copy(face.normal);
            } 
          }

          child.geometry.normalsNeedUpdate = true;
          //child.geometry.elementsNeedUpdate = true;
        }    //  for (var io = 0; io < scene.children.length; io++)

        render();
      }
    }     //   _web3dmObject.smoothMode

    var get2DCoords = function(pos, camera) 
    {
      var vector = pos.project(camera);
      vector.x =  (vector.x + 1) / 2 * window.innerWidth;
      vector.y = -(vector.y - 1) / 2 * window.innerHeight;
      return vector;
    };

    var AnyOrthoNormal = function(dir)
    {
      var n = new THREE.Vector3(0.0, 0.0, 0.0);
      var x = Math.abs(dir.x);
      var y = Math.abs(dir.y);
      var z = Math.abs(dir.z);

      if (x > y && x > z)
      {
        n.x = -(dir.y + dir.z) / dir.x;
        n.y = 1.0;
        n.z = 1.0;
      }
      else if (y > x && y > z)
      {
        n.y = -(dir.x + dir.z) / dir.y;
        n.x = 1.0;
        n.z = 1.0;
      }   
      else if (z > x && z > y)
      {
        n.z = -(dir.x + dir.y) / dir.z;
        n.x = 1.0;
        n.y = 1.0;
      }   

      n.normalize();
      return n;
    }

    var getCirclePoints = function(point, direction, radius, num_circle_points) 
    {
      var circle = [];  

      // Два вектора ортогональных между собой в плоскости ортогональной direction 
      var vect1 = AnyOrthoNormal(direction);
      var vect2 = new THREE.Vector3();
      vect2.crossVectors(direction, vect1);
      vect2.normalize();

      var angle_step = (Math.PI * 2.0) / num_circle_points;
      var angle = 0.0;
      for (var ic = 0; ic < num_circle_points; ic++)
      {
        var cos_a = Math.cos(angle);
        var sin_a = Math.sin(angle);

        var x = cos_a * vect1.x + sin_a * vect2.x;
        var y = cos_a * vect1.y + sin_a * vect2.y;
        var z = cos_a * vect1.z + sin_a * vect2.z;

        x *= radius;
        y *= radius;
        z *= radius;

        x = x + point.x;
        y = y + point.y;
        z = z + point.z;

        circle.push(new THREE.Vector3(x, y, z));
        
        angle += angle_step;
      }

      return circle;
    };

    ///////////////////////////////////////////////////////////////////////////
    ///                                 Текст/Диалог
    var createTextLabel = function() 
    {
      var div = document.createElement('div');

      div.className = 'text-label';
      div.style.position = 'absolute';
      div.style.width = 100;
      div.style.height = 100;
      div.innerHTML = "hi there!";
      div.style.top = -1000;
      div.style.left = -1000;
    
      var _this = this;
      var returnedObject = {};
      returnedObject.element = div;
      returnedObject.parent = null;
      returnedObject.positions = [];  // new THREE.Vector3(0,0,0);
      returnedObject.deltaX = [];     // new THREE.Vector3(0,0,0);
      returnedObject.deltaY = [];     // new THREE.Vector3(0,0,0);
      returnedObject.text = "";
      
      returnedObject.setHTML = function(html) 
      {
        this.text = html;
        this.element.innerHTML = html;
      };
      
      returnedObject.setParent = function(threejsobj) 
      {
        this.parent = threejsobj;
      };

      returnedObject.setPositions = function(parentPositions) 
      {
        this.positions = parentPositions;
      };

      returnedObject.setDirections = function(parentDirections) 
      {
        this.directions = parentDirections;
      };

      returnedObject.setDeltaX = function(deltaX) 
      {
        this.deltaX = deltaX;
      };

      returnedObject.setDeltaY = function(deltaY) 
      {
        this.deltaY = deltaY;
      };

      returnedObject.updatePosition = function() 
      {
        if (this.positions != null && this.positions.length > 0)
        {
          var np = this.positions.length;
          var visible = false;
          var prj_beg = get2DCoords(this.positions[0].center.clone(), camera);
          var prj_end = get2DCoords(this.positions[np - 1].center.clone(), camera); 
          var inversion = (prj_end.y < prj_beg.y) ? true : false; 

          for (var i = 0; i < np; i++)
          {
            var pos = this.positions[i].center.clone();
            var prj = get2DCoords(pos, camera);
            if ((prj.x < 0) || (prj.x >= window.innerWidth) || 
                (prj.y < 0) || (prj.y > window.innerHeight))
            {
              continue;
            }

            // ищем наиболее удаленную точку
            var maxDist = 0.0; 
            for (var j = 0; j < this.positions[i].circle.length; j++)
            {
              var pos1 = this.positions[i].circle[j].clone();
              var prj1 = get2DCoords(pos1, camera);
              var distX = Math.abs(prj1.x - prj.x);
              var distY = Math.abs(prj1.y - prj.y);
              var dist = Math.sqrt(distX * distX + distY * distY);
              if (dist > maxDist)
              {
                maxDist = dist;
              }
            }

            if (!inversion)
            {
              var font_size = (i == (np - 1)) ? 16 : 0;
              this.element.style.left = (prj.x + this.deltaX[i] * maxDist) + 'px';
              this.element.style.top = (prj.y + this.deltaY[i] * maxDist) + font_size + 'px';
            }
            else
            {
              var font_size = (i == 0) ? 16 : 0;
              this.element.style.left = (prj1.x + this.deltaX[i] * maxDist) + 'px';
              this.element.style.top = (prj1.y - this.deltaY[i] * maxDist) + font_size + 'px';
            }
              
            visible = true;
            break;
          }
          if (visible)
          {
             this.element.innerHTML = this.text;
          }
          else
          {
            this.element.innerHTML = "";
          }
        }
      };

      return returnedObject;
    }
    ///  Текст

    /// Message dialog
    var createMessageDialog = function() 
    {
      var div = document.createElement('div');

      div.className = 'text-label';
      div.style.position = 'absolute';
      div.style.width = 100;
      div.style.height = 100;
      div.innerHTML = "hi there!";
      div.style.top = -1000;
      div.style.left = -1000;
      
      div.style.backgroundColor = 'white';
      div.style.border = 'solid';
      div.style.borderColor = 'black';
      div.style.textAlign = 'center'; 
      div.style.padding = '5px'; 

      var messageDialog = {};
      messageDialog.mainElement = div;
      messageDialog.position = new THREE.Vector3(0,0,0);
      messageDialog.messages = [];
      messageDialog.expanded = false;
      messageDialog.indexmsg = -1;
      messageDialog.indexexp = -1;     
      messageDialog.button = null;
      messageDialog.status = false;
      messageDialog.block = false;

      messageDialog.setBlock = function(val) 
      {
        this.block = val;
      }

      messageDialog.getBlock = function() 
      {
        return this.block;
      }


      messageDialog.setStatus = function(val) 
      {
        this.status = val;
      }
      
      messageDialog.getStatus = function() 
      {
        return this.status;
      }

      messageDialog.countMessages = function() 
      {
        if (this.messages != null)
        {
          return this.messages.length;
        }
      }

      messageDialog.addMessage = function(message) 
      {
        if (this.messages != null)
        {
          this.messages.push(message);
        }
      }

      messageDialog.clearMessages= function() 
      {
        if (this.messages != null)
        {
          this.messages.splice(0, this.messages.length);
        }
      }

      messageDialog.setMessage = function(position, message) 
      {
        if (this.messages != null)
        {
          this.messages[position] = message;
        }
      }

      messageDialog.getMessage = function(position) 
      {
        if (this.messages != null && this.messages.length > position)
        {
          return this.messages[position];
        }
        return null;
      }

      messageDialog.updateMessage = function(position, message) 
      {
        if (this.messages != null)
        {
          if (this.messages.length > position)
          {
            this.messages[position] = message;
          }
          else
          {
            this.messages.push(message);
          }
        
         if (!this.status)
          {
            this.applyMessages();
          }
        }
      }
      

      messageDialog.applyMessages = function() 
      {
        while (this.mainElement.hasChildNodes())
        {
          this.mainElement.removeChild(this.mainElement.childNodes[0]);  
        }
         
        if (this.messages != null && this.messages.length > 0)
        {
          var b = document.createElement("b");
          this.mainElement.appendChild(b);
          var t = document.createTextNode(this.messages[0]);
          b.appendChild(t);
          var p0 = document.createElement("br");
          this.mainElement.appendChild(p0);
          for (var ii = 1; ii < this.messages.length; ii++)
          {
            if (ii > 1)
            {
              var p = document.createElement("br");
              this.mainElement.appendChild(p);
            }
            if (this.messages[ii] != null)
            {
              var t = document.createTextNode(this.messages[ii]);
              this.mainElement.appendChild(t);
            }
            else
            {
              this.button = document.createElement("button");
              this.button.className = "mayclass";
              this.button.innerText = "...";
              this.button.style.background = "white"; //"#AF4C50"; 
              this.button.style.color = "blue"; 
              this.button.style.font.size = "16px"; 
              this.button.style.width = "30px"; 
              this.button.style.border = "1px solid black";   // #4CAF50";

              var _this = this;
              this.button.onclick = function(event)
              {
                // Отключаем распространение сигнала 
                event.stopPropagation();
                  
                if (_this.expanded)
                {
                  while (_this.mainElement.childNodes.length > _this.indexexp)
                  {
                    var _length = _this.mainElement.childNodes.length;
                    _this.mainElement.removeChild(_this.mainElement.childNodes[_length - 1]);
                  }
                }
                else
                {
                  for (var j = _this.indexmsg + 1; j < _this.messages.length; j++)
                  {
                    var p = document.createElement("br");
                    _this.mainElement.appendChild(p);
                    var t = document.createTextNode(_this.messages[j]);
                    _this.mainElement.appendChild(t);
                  } 
                 // _this.button.style.backgroundImage = 'url(images/button_up.png';
                }
                _this.expanded = !(_this.expanded);
              }  // bt.onclick
                
              this.mainElement.appendChild(this.button);
              this.indexmsg = ii;
              this.indexexp = this.mainElement.childNodes.length;
              this.expanded = false;
              break;
            }   //  else: if (_messages[ii] != null)
          }     //  for (var ii = 1; ii < _messages.length; ii++) 
        }       //  if (_messages != null && _messages.length > 0)   
      };  // messageDialog.updateMessages
      
      messageDialog.setVisible = function(visible) 
      {
        if (visible)
        {
          if (!container.contains(this.mainElement))
          {
            container.appendChild(this.mainElement);
          }
        }
        else
        {
          if (container.contains(this.mainElement))
          {
            container.removeChild(this.mainElement);
          }
        }
      };

      messageDialog.setPosition = function(x, y) 
      {
        x += 12;
        y += 12;

        if (x +  window.innerWidth / 3 > window.innerWidth)
        {
          x -= window.innerWidth / 3;
        }
        if (y + window.innerHeight / 3 > window.innerHeight)
        {
          y -= window.innerHeight / 3;
        }
        
        this.mainElement.style.left = x + 'px';
        this.mainElement.style.top = y + 'px';
      };

      return messageDialog;
    }
    /// End of Message dialog

    /// PickMarker
    var createPickMarker = function() 
    {
      var div = document.createElement('div');
    
      div.className = 'image-label';
      div.style.position = 'absolute';
      div.style.width = "21px";
      div.style.height = "21px";
      div.style.top = 100 + 'px';
      div.style.left = 100 + 'px';
      div.style.background = "rgba(0xfa, 0xfa, 0xfa, 0.5)"; 
      
      var pickMarker = {};
      pickMarker.mainElement = div;
      pickMarker.position = new THREE.Vector3(0,0,0);
      pickMarker.canvas = document.createElement('canvas');

      pickMarker.draw = function () 
      {
        this.canvas.width = this.canvas.height = 20;
        let ctx = this.canvas.getContext("2d");
        if (ctx == null)
          return;

        var x = 10;
        var y = 10;  

			  ctx.strokeStyle = "#00759C";
		    ctx.beginPath();
		    ctx.arc(x, y, 8, 0, 2 * Math.PI);
		    ctx.lineWidth = 4;
	  	  ctx.stroke();
		    ctx.moveTo(x, y);
		    ctx.arc(x, y, 1, 0, 2 * Math.PI);
		    ctx.lineWidth = 2;
		    ctx.stroke();
        ctx.closePath();
      }

      pickMarker.draw();
      pickMarker.mainElement.appendChild(pickMarker.canvas);

      pickMarker.setPosition = function(pickedPoint) 
      {
         this.position = pickedPoint;
      }

      pickMarker.updatePosition = function() 
      {
        if (this.position != null)
        {
          var pos = this.position.clone();
          var coords2d = get2DCoords(pos, camera);
          coords2d.x -= 10;
          coords2d.y -= 10;

          var shiftX = 0;
          var shiftY = 0;
          if (renderer != 0)
          {
            shiftY = (renderer.domElement != null) ? renderer.domElement.offsetTop : 0;
            shiftX = (renderer.domElemen != null) ? renderer.domElemen.offsetLeft : 0;
          }

          coords2d.x += shiftX;
          coords2d.y += shiftY;

          if ((coords2d.x >= 0) && (coords2d.x < window.innerWidth) && 
              (coords2d.y >= 0) && (coords2d.y < window.innerHeight))
          {
              this.mainElement.style.left = coords2d.x + 'px';
              this.mainElement.style.top = coords2d.y + 'px';
          }
        }
      }

      return pickMarker;
    };             
    
    
    return _web3dmObject;
  }       

  if(typeof(window.Web3dm) === 'undefined')
  {
    window.Web3dm = web3dm();
  }

})(window); 

export default window.Web3dm;
