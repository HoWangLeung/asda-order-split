import React, { useEffect } from 'react'
import { Button, Checkbox, Form, Input, Modal } from 'antd';
export default function AddItemForm({ setIsAddItemModalOpen, isAddItemModalOpen, orderedItems, setOrderedItems }) {
    const [form] = Form.useForm();
    console.log(orderedItems);

    const onFinish = (values) => {
        console.log("adding items");
        if (!values) {
            return;
        }
        let isExist = orderedItems.find(o => o.itemName === values.itemName)
        if (isExist) {
            alert("Duplicate found")
            return;
        }


        if (values.pricePerItem) {
            values.pricePerItem = parseFloat(values.pricePerItem).toFixed(2)
        }
        if (values.quantity) {
            values.quantity = parseInt(values.quantity)
        }
        console.log('Success:', values);
        console.log("orderedItems:::",orderedItems);
        let newOrderedItems = [...orderedItems];


        newOrderedItems.push(values)
        let biggest = findBigestIndex(orderedItems);

        console.log("newOrderedItems::@@:", newOrderedItems);
        newOrderedItems.forEach((item,index) => {
            if (item.itemName === values.itemName) {
                item.itemName = values.itemName;
                item.quantity = values.quantity;
                item.pricePerItem = values.pricePerItem
                item.price = values.pricePerItem * values.quantity;
                item.price = item.price.toFixed(2)
                item.index=biggest+1
            }
        })
        console.log('newOrderedItems:', newOrderedItems);

        setOrderedItems((state) => [  ...newOrderedItems])
        setIsAddItemModalOpen(false)
    };

    const findBigestIndex = () => {
        let biggest = 0;
        orderedItems.forEach(i => {
            if (i.index > biggest) {
                biggest = i.index
            }
        })
        return biggest
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const handleCancel = () => {
        setIsAddItemModalOpen(false)
    }

    useEffect(() => {
        if (setIsAddItemModalOpen) {
            form.setFieldsValue({
                itemName: "",
                quantity: '',
                pricePerItem: '',
                currencySymbol: '£'

            });
        }
    }, [form]);



    return (
        <>
            <Modal

                width="50%" title="Add Item Manually" open={isAddItemModalOpen} onOk={form.submit} onCancel={handleCancel}  >
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
                    <Form.Item
                        label="Currency"
                        name="currencySymbol"
                    >
                        <Input
                            disabled
                        />
                    </Form.Item>

                </Form>
            </Modal>
        </>
    )
}
