import React, { useEffect } from 'react'
import { Button, Checkbox, Form, Input, Modal } from 'antd';
export default function EditForm({ setIsEditModalOpen, isEditModalOpen, orderedItems, currentEditItem, setOrderedItems }) {
    const [form] = Form.useForm();


    const onFinish = (values) => {
        if(!values){
            return;
        }
        if(values.pricePerItem){
            values.pricePerItem = parseFloat(values.pricePerItem).toFixed(2) 
        }
        if(values.quantity){
            values.quantity = parseInt(values.quantity)
        }
        console.log('Success:', values);
        let newOrderedItems = [...orderedItems];
        newOrderedItems.forEach(item => {
            if (item.itemName === values.itemName) {
                item.itemName = values.itemName;
                item.quantity = values.quantity;
                item.pricePerItem = values.pricePerItem
                item.price = values.pricePerItem *  values.quantity;
                item.price =   item.price.toFixed(2)
            }
        })
        console.log('newOrderedItems:', newOrderedItems);

        setOrderedItems(()=>[...newOrderedItems])
        setIsEditModalOpen(false)
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const handleOk = () => {
        setIsEditModalOpen(false)
    }
    useEffect(() => {
        if (isEditModalOpen) {
            form.setFieldsValue({
                itemName: currentEditItem.itemName,
                quantity: currentEditItem.quantity,
                pricePerItem: currentEditItem.pricePerItem

            });
        }
    }, [currentEditItem, form]);



    return (
        <Modal title="Edit Item" open={isEditModalOpen} onOk={form.submit} onCancel={() => {
            console.log("closing");
            setIsEditModalOpen(false)

        }}>
            <Form
                form={form}
                name="basic"
                labelCol={{
                    span: 8,
                }}
                wrapperCol={{
                    span: 16,
                }}
                style={{
                    maxWidth: 600,
                }}
                // initialValues={{
                //     itemName: currentEditItem.itemName,
                //     quantity:currentEditItem.quantity,
                //     pricePerItem:currentEditItem.pricePerItem
                // }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    label="Item Name"
                    name="itemName"
                    disabled
                >
                    <Input

                    />
                </Form.Item>

                <Form.Item
                    label="Quantity"
                    name="quantity"

                >
                    <Input

                    />
                </Form.Item>
                <Form.Item
                    label="Price Per Item"
                    name="pricePerItem"

                >
                    <Input



                    />
                </Form.Item>


            </Form>
        </Modal>
    )
}
