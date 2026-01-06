import {Button, Modal} from "antd";


const DeleteConfirmAction = ({onClose, onOK, ...res})=>{
    return (
        <Modal
            width={460}
            title={res.title}
            open={res.open}
            footer={() => {
                return (
                    <>
                        <Button type="primary" danger onClick={()=>onOK(res)} style={{marginRight: 8}}>
                            Delete
                        </Button>

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={onClose}>
                            Close
                        </Button>
                    </>
                )
            }}
        >
            <div>
                {res.content}
            </div>
        </Modal>

    )


}


export default DeleteConfirmAction;