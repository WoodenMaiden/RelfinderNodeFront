import {useEffect, useState} from "react";
import {MultiDirectedGraph} from "graphology";
import Sigma from "sigma";
import FileSaver from "file-saver"

import './SigmaCanvas.css'

export default function SigmaCanvas(props) {

    const [ogGraph, setOgGraph] = useState(new MultiDirectedGraph()) // The original graph
    let sigma = null

    useEffect(() => {
        let shownGraph = new MultiDirectedGraph()
        sigma = new Sigma(shownGraph, document.getElementById("sigmaroot"))

        sigma.refresh()
        sigma.clear()
        sigma.setSetting("stagePadding", 0)

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        //SAMPLE DATA
        const raw = JSON.stringify({
            "nodes": [
                "http://purl.uniprot.org/uniprot/M7Y7E2",
                "http://purl.uniprot.org/uniprot/M7Y4A4"
            ]
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        const URL = (props.url.slice(-1) === "/") ? props.url.slice(0, -1) : props.url
        fetch(`${URL}/relfinder/2`, requestOptions).then((res) => res.json().then((data) => {
            ogGraph.import(data);
            sigma.graph.import(data)
            ogGraph.forEachNode((node) => {
                const y = Math.floor(Math.random() * 100)
                const x = Math.floor(Math.random() * 100)

                ogGraph.setNodeAttribute(node, "x", x)
                sigma.graph.setNodeAttribute(node, "x", x)
                ogGraph.setNodeAttribute(node, "y", y)
                sigma.graph.setNodeAttribute(node, "y", y)

                ogGraph.setNodeAttribute(node, "label", node)
                sigma.graph.setNodeAttribute(node, "label", node)

                ogGraph.setNodeAttribute(node, "color", "#FA4F40")
                sigma.graph.setNodeAttribute(node, "color", "#FA4F40")

                ogGraph.setNodeAttribute(node, "size", 5)
                sigma.graph.setNodeAttribute(node, "size", 5)
            })

            ogGraph.forEachEdge((edge) => {
                ogGraph.setEdgeAttribute(edge, "type", "arrow")
                .setEdgeAttribute(edge, "type", "arrow")
            })

            sigma.refresh()
        }))
    }, [ogGraph, props.url])

    function resetGraph() {
        sigma.graph = ogGraph.copy()
        const inputField = document.getElementById("searchinput")
        inputField.value = ""
        sigma.refresh()
    }

    function search(event) {
        if ((event._reactName === "onKeyPress" && event.key === "Enter") ||
            event._reactName === "onClick") event.preventDefault()
        else return; // to not run this function

        const elt = document.getElementById("searchinput")
        const back = document.getElementsByClassName("deployedbutton")[0]
        const input = elt.value.trim()

        if (ogGraph.hasNode(input)) {
            sigma.graph = ogGraph.copy()

            sigma.graph.setNodeAttribute(input, "color", "#2f7e1e")
            sigma.graph.setNodeAttribute(input, "size", 10)

            const focused = sigma.graph.outNeighbors(input)
            focused.push(input)

            const focusedEdges = sigma.graph.outEdges(input)

            sigma.graph.forEachNode(node => {
                if(!focused.includes(node)) sigma.graph.dropNode(node)
            })

            sigma.graph.forEachEdge(edge => {
                if(!focusedEdges.includes(edge)) sigma.graph.dropEdge(edge)
            })

            sigma.refresh()
        }
        else {
            const defColor = elt.style.backgroundColor
            elt.style.backgroundColor = "#FA4F40"
            back.style.backgroundColor = "#FA4F40"
            setTimeout(() => {
                elt.style.backgroundColor = defColor
                back.style.backgroundColor = defColor
                setTimeout(() => {
                    back.style.backgroundColor = "#FA4F40"
                    elt.style.backgroundColor = "#FA4F40"
                    setTimeout(() => {
                        elt.style.backgroundColor = defColor
                        back.style.backgroundColor = defColor
                    }, 150)
                }, 150)
            }, 150)
        }
    }

    function screenshot(event) {
        //https://codesandbox.io/s/github/jacomyal/sigma.js/tree/main/examples/png-snapshot?file=/saveAsPNG.ts:27-63
        const {width, height} = sigma.getDimensions()
        const pixelRatio = window.devicePixelRatio || 1;

        const hidden = document.getElementById("hidden")
        hidden.style.width = `${width}px`;
        hidden.style.height = `${height}px`;
        hidden.style.position = "absolute";
        hidden.style.right = "101%";
        hidden.style.bottom = "101%";

        const tmpRenderer = new Sigma(sigma.getGraph(), hidden, sigma.getSettings());

        tmpRenderer.getCamera().setState(sigma.getCamera().getState());
        tmpRenderer.refresh();

        const canvas = document.createElement("CANVAS")
        canvas.setAttribute("width", width * pixelRatio + "")
        canvas.setAttribute("height", height * pixelRatio + "")
        const ctx = canvas.getContext("2d")

        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width * pixelRatio, height * pixelRatio)

        const canvases = tmpRenderer.getCanvases()
        const layers = Object.keys(canvases)
        layers.forEach(id => {
            ctx.drawImage(
                canvases[id],
                0,
                0,
                width * pixelRatio,
                height * pixelRatio,
                0,
                0,
                width * pixelRatio,
                height * pixelRatio,
            )
        })

        canvas.toBlob(blob => {
            const d = new Date()
            if (blob) FileSaver.saveAs(blob, `RFR_${d.getDate()}/${d.getMonth()}/${d.getFullYear()}-${d.getHours()}:${d.getMinutes()}`)

            tmpRenderer.kill();
        }, "image/png")
    }

    return (
        <div id="sigmacanvas">
	        <div id="sigmaroot">
	            <ul>
	                <li>
	                    <div id="search" className="deployedbutton">
	                       <form>
	                           <input type="search" id="searchinput" name="toSearch" placeholder="Node to search" onKeyPress={search}/>
	                           <span className="material-icons-round clickable" onClick={search}>
	                               search
	                           </span>
	                           <span className="material-icons-round clickable" onClick={resetGraph}>
	                              restart_alt
	                           </span>
	                       </form>
	                   </div>
	                </li>

	                <li>
	                    <div className="roundbutton clickable" onClick={screenshot}>
	                       <span className="material-icons-round">
	                          photo_camera
	                       </span>
	                    </div>
	                </li>

	                <li>
	                    <div className="roundbutton clickable">
	                       <span className="material-icons-round">
	                           add
	                       </span>
	                    </div>
	                </li>

	                <li>
	                    <div className="roundbutton clickable">
	                       <span className="material-icons-round">
	                           remove
	                       </span>
	                    </div>
	                </li>
	            </ul>
	        </div>
	        <div id="hidden">

	        </div>
        </div>
    )
}