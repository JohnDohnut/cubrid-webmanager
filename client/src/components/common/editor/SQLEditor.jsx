import React, {useEffect, useState} from 'react';
import Editor from '@monaco-editor/react';
import {useSelector} from "react-redux";


const SQLEditor = () => {
    const {tabs, activeTabKey} = useSelector(state => state.tab);
    const [sql, setSql] = useState("");

    useEffect(() => {
        const tab = tabs.find(res => res.key === activeTabKey)
        if(tab.sql){
            setSql(tab.sql.join("\n"));
        }

    },[])

    const handleChange = (value)=>{
        // setIsChange(true)

    }

    return (
        <Editor
            height="100%"
            defaultLanguage="sql"
            value={sql}
            theme="vs-white"
            onChange={handleChange}
            options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                wordWrap: "on",         // ✅ useful for long SQL
                scrollBeyondLastLine: false,
                renderLineHighlight: "all",
            }}
        />
    );
};

export default SQLEditor;
