import styles from './Button.module.css'


export default function (props) {
    return (
        <button {...props} onClick={()=>{}} className={styles.icon_button}>
            {props.children}
        </button>
    )
}


