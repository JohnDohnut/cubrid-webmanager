import {Tooltip, Typography} from "antd";
import React from "react";
import styles from '../styles/HostCard.module.css'
import Ripples from "react-ripples";



export  const HostCard = ({alias, address, port, active, onContextMenu, onClick}) =>{

    const getToolTip = () => {
        return (
            <div className={styles.card__description}>
                <div><span>Host</span>: {address}</div>
                <div><span>Port</span>: {port}</div>
            </div>
        )
    }
    return (
        <Tooltip placement="right" title={getToolTip()}>
            <div className={`${styles.card} ${active? styles.active_card: ""}`} onContextMenu={onContextMenu}>
                <Ripples className={styles.card__ripples} during={800} color={'rgb(44, 62, 80, 0.4)'} onClick={onClick}>
                    <div className={styles.card__wrapper}>
                        <div className={styles.card__content}>
                            <div className={styles.card__title}>{alias}</div>

                        </div>
                        <div className={`${styles.card__decor}`}>
                            <svg viewBox="0 0 153 153" fill="none" xmlns="http://www.w3.org/2000/svg"
                                 className="absolute top-1/2 -right-2 origin-right -translate-y-1/2 text-neutral-200/75 *:ease-in *:group-hover:duration-500 dark:text-neutral-800">
                                <path
                                    d="M82.3349 16.833L82.3344 1H34.8345L34.835 16.833M82.3349 16.833H120.334V76.9994M82.3349 16.833L66.5007 16.8333L34.835 16.833M82.3349 16.833L82.3347 45.3333M34.835 16.833H12.6673V45.3333M34.8345 96.0006L34.8348 76.9994L34.8345 45.3333H12.6673M34.8345 96.0006H19.0007L12.6673 95.9988V45.3333M34.8345 96.0006V108.667V124.5H50.6671M50.6671 124.5V137.166H66.501M50.6671 124.5L50.6673 108.667M66.501 137.166H82.3349M66.501 137.166L66.5005 108.667H50.6673M82.3349 137.166V153H139.333M82.3349 137.166H91.8341L91.8337 124.5M139.333 153L139.335 137.167M139.333 153H152L152.001 137.167M145.668 111.832H152.001V137.167M145.668 111.832V86.5H129.834M145.668 111.832L129.834 111.834V86.5M129.834 86.5V76.9994H120.334M120.334 76.9994H82.3344M82.3344 76.9994L82.334 96.0003V111.833L91.8337 111.834V124.5M82.3344 76.9994L82.3347 45.3333M91.8337 124.5H126.667L126.668 137.166L139.335 137.167M152.001 137.167H139.335M82.3347 45.3333H66.5005L66.5008 76.9994H50.6671L50.6673 108.667M114.001 96L104.501 95.9988V111.83L114.001 111.832V96ZM19.0007 115H6.33398V134H19.0007V115Z"
                                    stroke="currentColor" strokeLinejoin="round"
                                    className="group-hover:text-blue-200 group-hover:transition-colors dark:group-hover:text-blue-900"></path>
                                <path
                                    d="M34.834 45.3333H12.6673V16.8333H34.834V1H82.334V16.8333H120.334V77H82.334V111.833H91.834V124.5H126.667V137.167H152.001V153H82.334V137.167H66.5007V108.667H50.6673V124.5H34.834V45.3333Z"
                                    stroke="currentColor" strokeLinejoin="round"
                                    className="db-card text-blue-300 opacity-0 drop-shadow-[0px_0px_2px_#93C5FD50] transition-opacity group-hover:opacity-100 dark:text-blue-700 dark:drop-shadow-[0px_0px_5px_#1D4ED8]"></path>
                            </svg>
                        </div>
                    </div>
                </Ripples>
            </div>
        </Tooltip>


    )
}
export default HostCard