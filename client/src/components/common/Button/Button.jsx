import Ripples from 'react-ripples'
export default function (props) {

    return (
        <div className={"button__animate"}>
            <Ripples color={'rgb(44, 62, 80, 0.4)'}>
                <button {...props}>
                    {props.children}
                </button>
            </Ripples>
        </div>
    )

}