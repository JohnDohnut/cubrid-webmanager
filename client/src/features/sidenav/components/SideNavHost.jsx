import { useEffect, useState, useMemo } from "react";
import HostCard from "./HostCard.jsx";
import styles from '../styles/SideNavHost.module.css';
import { setHostHeight } from "../sideNavSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { addTab } from "@/shared/slice/tabSlice.js";
import { getHostFormat } from "@/lib/treeFormat.js";
import { setActiveHost, setHosts } from "@/features/domain/host/hostSlice.js";
import HorizontalResize from "@/components/common/HorizontalResize/HorizontalResize.jsx";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {getHostsAPI, hostLogin} from "@/features/domain/host/hostAPI.js";
import HostMenu from "@/features/sidenav/components/menus/HostMenu.jsx";




const SideNavHost = () => {
    const { hosts, activeHost } = useSelector(state => state.host);
    const { hostHeight } = useSelector(state => state.sidenav);
    const [height, setHeight] = useState(hostHeight);
    const [menu, setMenu] = useState({open: false});
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setBuffering(true))
        getHostsAPI().then((res) => {
            if (res) {
                const newHosts = res.map(host => getHostFormat(host));
                dispatch(setHosts(newHosts));
            }
            dispatch(setBuffering(false));
        });
    }, []);

    const handleClick = (host) => {
        hostLogin(host).then(() => {
            dispatch(setActiveHost(host));
            dispatch(addTab(host));
        })

    };

    const onChangeHeight = (h) => {
        setHeight(h);        // smooth UI
    };


    const handleContextMenu = (e, host) => {
        e.preventDefault();
        setMenu({...e, host, open: true});
        // menus.forEach((item) => {
        //     if(item.type === server.type){
        //         setMenu({...e, server, Screen: item.Screen,  open: true});
        //     }
        // })
    };

    // memoized style object
    const panelStyle = useMemo(() => ({ height }), [height]);

    return (
        <>
            <HostMenu {...menu} onClose={()=>setMenu({open: false})}/>
            <div style={panelStyle} className={styles.layout}>
                {hosts.map(host => {
                    const {key, ...res} = host;
                    return (
                        <HostCard
                            key={key}
                            {...res}
                            active={host.uid === activeHost.uid}
                            onClick={() => handleClick(host)}
                            onContextMenu={(e)=>handleContextMenu(e, host)}
                        />
                    );
                })}
            </div>

            <HorizontalResize onChangeHeight={onChangeHeight}
                              currentHeight={height}
                              onRelease={(h)=>dispatch(setHostHeight(h))}
            />
        </>
    );
};

export default SideNavHost;
