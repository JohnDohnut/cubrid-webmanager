import styles from "./ActionBar.module.css";
import ActionButton from "./ActionButton.jsx";
import {useDispatch} from "react-redux";
import {setHostConnection} from "@/features/appbar/appBarSlice.js";





const ActionBar = ()=>{
    const dispatch = useDispatch();
    return (
        <div className={styles.layout}>
            <ActionButton
                onClick={() => dispatch(setHostConnection({open: true, type: "add"}))}
                icon={<i className="fa-solid fa-rectangle-history-circle-plus"/>}
                          title={"Add Host"} />
            <ActionButton icon={<i className="fa-regular fa-play"/>} title={"Start"}/>
            <ActionButton icon={<i className="fa-regular fa-table"/>} title={"Schema"}/>
            <ActionButton icon={<i className="fa-solid fa-arrow-right-arrow-left"></i>} title={"Data"}/>
        </div>
    )
}

export default ActionBar;