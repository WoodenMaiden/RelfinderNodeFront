import {useEffect, useState} from "react";
import {MultiDirectedGraph} from "graphology";
import Sigma from "sigma";

import './SigmaCanvas.css'

export default function SigmaCanvas(props) {

    const [graph, setGraph] = useState(new MultiDirectedGraph())
//    const [sigma, setSigma] = useState(null)

    useEffect(() => {
        const root = document.getElementById("sigmaroot")

        const sigma = new Sigma(graph, root)
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
            graph.import(data);
            graph.forEachNode((node) => {
                graph.setNodeAttribute(node, "x", Math.floor(Math.random() * 100))
                graph.setNodeAttribute(node, "y", Math.floor(Math.random() * 100))
                graph.setNodeAttribute(node, "label", node)
                graph.setNodeAttribute(node, "size", 5)
                graph.setNodeAttribute(node, "color", "#FA4F40")
            })

            graph.forEachEdge((edge) => {
                graph.setEdgeAttribute(edge, "type", "arrow")
            })
            sigma.refresh()
        }))
    })

    return (
        <div id="sigmaroot">
            <ul>
                <li>
                    <div className="roundbutton clickable">
                       <span className="material-icons-round">
                           search
                       </span>
                   </div>
                </li>

                <li>
                    <div className="roundbutton clickable">
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
    )
}