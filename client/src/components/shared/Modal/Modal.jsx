import React, { useState } from 'react';
import { Button, Modal } from 'antd';

const ModalComponent = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    props.doTransaction();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  console.log(props.transaction)

  return (
    <>
      <Modal title="Please confirm the below transactions!" open={props.isModalOpen} onOk={handleOk} onCancel={() => props.closeModal()}>
        <h3>{props.intentContext}</h3>
         {/* {props.transaction && props.transaction.map(txn => {
            return (
                <p>
                    {JSON.stringify(txn)}
                </p>
            )
         })} */}
      </Modal>
    </>
  );
};
export default ModalComponent;