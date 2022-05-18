import React, {useEffect} from 'react';
import Web3dm from './libs/web3dm.js'

function View3D(props, ref)
{
  const view3dRef = React.useRef(null);
  const web3dRef = React.useRef(null);
  const controls = React.useRef(null);
  const [perfsChecked, setPerfsChecked] = React.useState(false);
  const [litosChecked, setLitosChecked] = React.useState(false);
  let [pickChecked, setPickChecked] = React.useState(false);
   // State to store uploaded file
  const [file, setFile] = React.useState("");
   // Select parameters
  const [paramValue, setParamValue] = React.useState(''); 
  const[_modelLoaded, setModelLoaded]= React.useState(false); 

  useEffect(()=> 
  {
    if (Web3dm.init(web3dRef))
    {
      // this.mount.appendChild(element);
      //this.controls = Web3dm.camControls;
    }
   
  }, []);

  ////////////////////////////////////////////////////////////////
  // Controls
  // #1
  var clearModel = function() 
  {
    var drawer = window.Web3dm;
    if (drawer != null)
    {
      console.log("Clear model");
      drawer.clearModel();
      setFile("");
    }
    //document.getElementById("input-field").setValue("");
  }

  // #0

  var selectedFile = null;
  var loadModel = (fileEvent) => {
    if (fileEvent.target.files == null)
      return;

    setFile(fileEvent.target.files[0]);
    selectedFile = fileEvent.target.files[0];

    if (selectedFile.name.substr(0, 5) !== "model")
    {
      console.log("Model file was not selected")
      return;
    }

    if (_modelLoaded)
    {
      console.log("Clear model");
      window.Web3dm.clearModel();
      setModelLoaded(false);
    }

    var reader = new FileReader();
    reader.onload = function(fileEvent) 
    {
      // console.log(e.target.result);
      var jsonText = fileEvent.target.result; 
      var drawer = window.Web3dm;
      if (drawer != null)
      {
        if (!drawer.mounted())
        {
          drawer.init("viewport3d");
        }
        var jsonObject = JSON.parse(jsonText);
        drawer.setViewPerfs(perfsChecked);
        drawer.setViewLitos(litosChecked);
        drawer.setModel(jsonObject);
        setModelLoaded(true);
      }
    }  // reader.onload
  
    console.log("Read file " + selectedFile.name);
    reader.readAsText(selectedFile);
    }; // loadModel  

  // #2
  var getLayers = ()=> 
  {
  }

  //#3
  var handleParamsChange = (event) =>
  {
    if (!_modelLoaded)
    {
      return;
    }
  
    let parameter = event.target.value;
    setParamValue(parameter);
   
    var drawer = window.Web3dm;
    if (drawer != null)
    {
      if (parameter == "Undef")
      {
        drawer.changeParamVisibility(parameter, false);
      }
      else
      {
        drawer.changeParamVisibility(parameter, true);
      }
    }    //  if (drawer != null)  
  }

  //#4
  var viewDef = () => 
  {
    var drawer = window.Web3dm;
    if (drawer != null)
      drawer.viewDef();
  }

  //#5
  var viewAll = () =>
  {
    var drawer = window.Web3dm;
    if (drawer != null)
      drawer.viewAll();
  }

  //#6
  var Perfs = ()=> 
  {
    setPerfsChecked(!perfsChecked);
    var drawer = window.Web3dm;
    if (drawer != null)
    {
      drawer.viewPerfs(!perfsChecked);
    }
  }
  
  //#7
  var Litos = ()=> 
  {
    setLitosChecked(!litosChecked);
    var drawer = window.Web3dm;
    if (drawer != null)
    {
      drawer.viewLitos(!litosChecked);
    }
  }
  
  //#8
  var Pick = ()=> 
  {
     pickChecked = setPickChecked(!pickChecked);
  }
  
  controls.current = {loadModel, clearModel, getLayers, handleParamsChange, viewDef, viewAll, Perfs, Litos, Pick};

  return ( 
        <div className = 'view3dRef' ref = {view3dRef}>
          <div className = 'root1' style = {{margin: '15px'}}>
            <input type = "file"  accept = ".json" onChange= { controls.current.loadModel }/>
            <button onClick= { ()=> {controls.current.clearModel();} } >
              Destroy
            </button>
            <button onClick= { ()=> {controls.current.getLayers();} } disabled = 'false'>
               Layers
            </button>
            <select onChange= { (e)=> {controls.current.handleParamsChange(e);} } >
             <option value = 'Undef'> Undefined</option>
             <option value = 'poro'>Porosity</option>
             <option value = 'permx'>X-permeability</option>
             <option value = 'Soil'> soil</option>
            </select>
            < button  onClick= { ()=> {controls.current.viewDef();} } >
              Default view
            </button>
            <button  onClick= { ()=> {controls.current.viewAll();} } >
              View all
            </button>
            <label>  
              <input type="checkbox"  checked = {perfsChecked}  onChange= { ()=> {controls.current.Perfs();}}/>
               View perforation
            </label>  
            <label>  
              <input type ="checkbox"  checked = {litosChecked} onChange= { ()=> {controls.current.Litos();}}/>
              View litology
            </label>  
            <label>  
              <input type ="checkbox"  checked = {pickChecked} onChange= { ()=> {controls.current.Pick();}} disabled = 'false'/>
              Picked mode
            </label>  
          </div>
          <div  className = 'web3dRef' ref = {web3dRef}/>
        </div> );
 
 }

Web3dm.getData3DPath = function ()
{
  return process.env.PUBLIC_URL + '/data3d/';
}

Web3dm.loadData = function(fileName, callback, callbackParameter)
{
  var xhr = new XMLHttpRequest();
  xhr.onload = function()
  {
    let responseObj = xhr.response;
    callback(responseObj, callbackParameter);
    return;
  };

  xhr.onerror = function()
  {
    let errorMessage = "Отсутствует файл " + fileName; 
    alert(errorMessage);
    return;
  }
  let url = this.getData3DPath() + fileName;
  xhr.getResponseHeader("Content-Type", 'aplication/json', 'charset=utf-8');
  xhr.open("get", url, true);
  xhr.responseType = 'json'; 
  xhr.send();
}  //function Web3dm.loadData

export default View3D= React.forwardRef(View3D); // eslint-disable-next-line