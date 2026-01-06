import React from 'react';
import {Modal, Tabs} from 'antd';
import {useDispatch, useSelector} from "react-redux";
import { TAB_SCREEN } from '@/shared/variables';
import { removeTab, setActiveTabKey } from '@/shared/slice/tabSlice';
import styles from './AppLayout.module.css'
// import {deleteContents, setActivePanel, setSelectedObject, setSignalSavePanel} from "@/state/generalSlice";


const MainContent = () => {
    const {activeTabKey, tabs, unsavedTabs} = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const onChange = (key) => {
        dispatch(setActiveTabKey(key));
    };

    const remove = (targetKey) => {
        
        if(tabs.length > 1) {
            const activeKey = tabs.at(-2).key;
            dispatch(setActiveTabKey(activeKey));
        }else {
            dispatch(setActiveTabKey(""));
        }
        dispatch(removeTab(targetKey));

    };
    const onEdit = (targetKey, action) => {
        if (action === "remove") {
            if(unsavedTabs.includes(targetKey)) {
                // dispatch(setClosePanelKey(targetKey));
            }else{
                remove(targetKey);
            }

        }
    };
    return (
            <Tabs
                className={styles.main__container}
                hideAdd
                onChange={onChange}
                activeKey={activeTabKey}
                type="editable-card"
                onEdit={onEdit}
                items={tabs.map(({key, title, icon, type})=>{
                    const Com = TAB_SCREEN[type]
                    return{
                        key,
                        label: title,
                        icon,
                        closeIcon: <i className="fa-solid fa-xmark" style={{fontSize: 13}}></i>,
                        children: <Com uniqueKey={key}/> }
                })}
                size={"large"}
                tabBarStyle={{
                    borderRadius: 12,
                }}
            >

            </Tabs>

    );
};
export default MainContent;