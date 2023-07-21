import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Space, Table, Tag } from 'antd';
import Modal from 'antd/es/modal/Modal';
import { Input } from 'antd';
import { Typography } from 'antd';
import EditForm from './components/EditForm';
import AddItemForm from './components/AddItemForm';
import Logo from './components/Logo';
import MyButton from './components/MyButton';

const { TextArea } = Input;


const { Text, Title } = Typography;
function App() {

  const [text, setText] = useState("");
  const [orderedItems, setOrderedItems] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numberOfPerson, setNumberOfPerson] = useState(2);
  const [confirmedItems, setConfirmedItems] = useState([])
  const [combinedInfo, setCombinedInfo] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState({});
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)


  useEffect(() => {

    const combinedInfo = confirmedItems.reduce((acc, item) => {
      const { person, pricePerItem, quantity } = item;
      const total = pricePerItem * quantity;

      if (!acc[person]) {
        acc[person] = { person, total };
      } else {
        acc[person].total += total;
      }

      return acc;
    }, []);
    setCombinedInfo(() => [...combinedInfo])
  }, [confirmedItems]);
  useEffect(() => {

    //split items by lines
    const items = text.split('\n\n');
    const itemNames = items.map(item => extractItemName(item)).filter(item => item !== null);;
    const itemInfo = items.map(item => extractItemInfo(item)).filter(item => item !== null);;
    if (itemInfo.length > 0) {
      let currencySymbol = '£';

      let currency = currencySymbol;

      itemInfo.forEach((item,index) => {
        if (item && item.price) {
          let key=index+1
          const quantity = parseInt(item.itemName.split(" ")[0]); // Extract quantity from "1 x" format
          const itemName = item.itemName.split(" ").slice(2).join(" ");
          item.price = parseFloat(item.price.replace(currencySymbol, ''));
          item.currencySymbol = currencySymbol
          item.problematic = quantity ? false : true
          item.quantity = quantity ? quantity : 1
          item.itemName = itemName
          item.pricePerItem = item.price / item.quantity
          item.index= orderedItems.length>0 ?findBigestIndex()+key : index+1
        }

      });

      setOrderedItems((state)=>[...state,...itemInfo])
    }

  }, [text]);

  const findBigestIndex = () => {
    let biggest = 0;
    orderedItems.forEach(i => {
        if (i.index > biggest) {
            biggest = i.index
        }
    })
    return biggest
}

  const extractItemName = (item) => {
    const lines = item.split('\n');
    const reviewIndex = lines.findIndex(line => line.includes('Write a Review'));
    if (reviewIndex >= 3) {
      return lines[reviewIndex - 2];
    }
    return null;
  };

  const extractItemInfo = (item) => {
    const lines = item.split('\n');
    const reviewIndex = lines.findIndex(line => line.includes('Write a Review'));
    if (reviewIndex >= 3 && lines.length > reviewIndex + 2) {
      const itemName = lines[reviewIndex - 2];
      const price = lines[reviewIndex + 2];
      return { itemName, price };
    }
    return null;
  };
  function removeWieghtChange(output) {
    const lines = output.split('\n'); // Split the output into an array of lines

    let finalOutput = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.match(/Weight change/i)) {
        continue; // Skip the line if it contains the word "Weight change" (case-insensitive)
      }

      finalOutput += line + '\n'; // Append the line to the final output
    }
    return finalOutput;
  }

  const handleChange = (event) => {

    let output = removeGapInDiscountedPrice(event);


    output = removeWieghtChange(output);

    setText(output);


  };


  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = (event, item) => {
    let newOrderedItems = [...orderedItems]
    newOrderedItems = newOrderedItems.filter(o => o.itemName !== item.itemName)
    setOrderedItems(() => [...newOrderedItems])
  }

  const renderColumns = () => {
    let columns = [
      {
        title: 'Index',
        dataIndex: 'index',
        key: 'index',

      },
      {
        title: 'Name',
        dataIndex: 'itemName',
        key: 'itemName',

      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'name',

      },

      {
        title: 'Price (per item)',
        dataIndex: 'pricePerItem',
        key: 'pricePerItem',
        render: (_, item) => (
          <>
            {`£${item.pricePerItem}`}
          </>
        ),
      },
      {
        title: 'Total Price',
        dataIndex: 'price',
        key: 'price',
        render: (_, item) => (
          <>
            {`£${item.price}`}
          </>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, item) => (
          <Space size="middle">
            {renderAddButtons(item)}
          </Space>
        ),
      },
      {
        title: 'Operation',
        key: 'operation',
        render: (_, item) => (
          <Space size="middle">
            {renderOperationButtons(item)}
          </Space>
        ),
      },
    ];
    return columns
  }
  const handleAddClick = (event, item, index) => {
    let hasAddedItem = false;
    event.preventDefault()
    let confirmedItem = Object.assign({}, item);
    confirmedItem.quantity = 1;
    let newConfirmedItems = [...confirmedItems]
    confirmedItem.person = index

    const isExist = confirmedItems.find(i => i.itemName === item.itemName && i.person === index);
    if (!isExist) {
      newConfirmedItems.push(confirmedItem);
      hasAddedItem = true;
    } else {
      newConfirmedItems.forEach(i => {
        if (i.itemName === confirmedItem.itemName && i.person === index) {
          i.quantity += 1;
          hasAddedItem = true;
        }
      })
    }

    if (hasAddedItem) {
      minusQuantityInOrderedItems(item, index)
    }


    setConfirmedItems(state => [...newConfirmedItems]);
  };
  const minusQuantityInOrderedItems = (item, index) => {
    let newOrderedItems = [...orderedItems]
    newOrderedItems.forEach(i => {
      if (i.itemName === item.itemName && i.quantity > 0) {
        i.quantity -= 1;
      }
    })

    setOrderedItems(() => [...newOrderedItems])
  }

  const handleEdit = (event, item) => {

    setCurrentEditItem(item)
    setIsEditModalOpen(true)


  }
  const renderOperationButtons = (item) => {
    const buttons = [];

    for (let i = 0; i < numberOfPerson; i++) {
      buttons.push(
        <MyButton label={`Add to Person ${i + 1}`}  type='primary' key={i} onClick={(event) => handleAddClick(event, item, i)} disabled={item.quantity <= 0} >
          
        </MyButton>
      );
    }

    return buttons;
  };
  const renderAddButtons = (item) => {
    const buttons = [];
    buttons.push(
      <Button type='primary' key="edit" onClick={(event) => handleEdit(event, item)}>
        Edit
      </Button>
    )
    buttons.push(
      <Button danger type="primary" key="delete" onClick={(event) => handleDelete(event, item)}>
        Delete
      </Button>
    )

    return buttons;
  };
  const renderData = () => {

    const data = orderedItems.map(item => ({
      key: item.itemName,
      index:item.index,
      itemName: item.itemName,
      price: item.price,
      pricePerItem: item.pricePerItem,
      quantity: item.quantity,
      currencySymbol: item.currencySymbol,
      problematic: item.problematic
    }))


    return data
  }

  const renderCards = () => {
    const cards = [];
    for (let i = 0; i < confirmedItems; i++) {
      let confirmedItem = confirmedItems[i]
      cards.push(

      );
    }


    return cards;
  }
  const renderPersonColumn = (index) => {
    return [
      {
        title: 'Name',
        dataIndex: 'itemName',
        key: 'itemName',

      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'name',

      },
      {
        title: 'Total Price',
        dataIndex: 'price',
        key: 'price',
        render: (_, item) => (
          <>
            {`£${item.price}`}
          </>
        )
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, item) => (
          <Space size="middle">
            <Button danger type="primary" onClick={(event) => removeItemFromPerson(event, item)}  >Remove</Button>
          </Space>
        ),
      },
    ]
  }

  const removeItemFromPerson = (event, item) => {
    event.preventDefault()
    let newConfirmedItems = [...confirmedItems];
    let originalQuantity = -1;

    let removeIndex = -1;
    newConfirmedItems.forEach((eachItem, index) => {

      if (eachItem.itemName === item.itemName && eachItem.person === item.person) {
        originalQuantity = eachItem.quantity;
        eachItem.quantity = 0;
        if (eachItem.quantity == 0) {
          removeIndex = index
        }
      }
    })




    addQuantityBackToOrderedItem(originalQuantity, item)

    if (removeIndex != -1) {

      newConfirmedItems.splice(removeIndex, 1);
    }

    setConfirmedItems(() => [...newConfirmedItems]);


  }

  const addQuantityBackToOrderedItem = (originalQuantity, item) => {
    let newOrderedItems = [...orderedItems]
    newOrderedItems.forEach((i, index) => {
      if (i.itemName === item.itemName) {
        i.quantity += originalQuantity;
      }
    })
    setOrderedItems(() => [...newOrderedItems]);
  }
  const renderPersonData = (index) => {

    let filterItems = [...confirmedItems]
    filterItems = filterItems.filter(c => c.person === index)
    const data = filterItems.map(item => ({
      key: item.itemName,
      itemName: item.itemName,
      price: item.pricePerItem * item.quantity,
      quantity: item.quantity,
      person: item.person

    }))

    return data
  }

  const renderTotalForEachPerson = (index) => {
    let filterItems = [...confirmedItems]
    filterItems = filterItems.filter(c => c.person === index)
    let total = 0;
    let symbol = null;
    filterItems.forEach(item => {
      total = total + (item.pricePerItem * item.quantity)
      symbol = item.currencySymbol
    })


    return (<Text strong>Total: {symbol}{Number(total).toFixed(2)}</Text>)
  }
  function removeGapInDiscountedPrice(event) {
    let textInput = event.target.value;
    const lines = textInput.split('\n'); // Split the text into an array of lines

    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].match(/^price £\d+(\.\d+)?, was £\d+(\.\d+)?$/)) {
        lines.splice(i - 1, 2); // Remove the empty line above and the current line
      }
    }

    const finalText = lines.join('\n');
    return finalText;
  }

  const renderCombinedInfo = () => {

    let filteredCombinedInfo = [...combinedInfo]
    filteredCombinedInfo = combinedInfo.filter(d => d != undefined)
    if (filteredCombinedInfo.length == 2) {
      const combinedTotal = filteredCombinedInfo.map(({ person, total }) => `${Number(total).toFixed(2)}`).join(' + ');

      const finalSum = filteredCombinedInfo.reduce((acc, { total }) => acc + total, 0);

      const personsString = filteredCombinedInfo.map(({ person }) => `Person ${person + 1}`).join(' + ');

      const finalOutput = `${personsString}:\n${combinedTotal} = ${finalSum}`;



      return (<>
        <Title level={4}>{personsString}</Title>
        <Text italic strong>{`${combinedTotal} = £${Number(finalSum).toFixed(2)}`}</Text>
      </>)
    }
    return <></>
  }
  return (
    <div className="App">

      <Logo />

      <Row className='contentContainer' justify="center">
        <AddItemForm
          isAddItemModalOpen={isAddItemModalOpen}
          setIsAddItemModalOpen={setIsAddItemModalOpen}
          orderedItems={orderedItems}
          setOrderedItems={setOrderedItems}

        />

        <Modal 
        
        
        width="50%" title="Import Order" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
          <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item
              label={"Number of Person"}
            >
              <Input value={numberOfPerson} placeholder="Number of Persons" />
            </Form.Item>

            <Form.Item
              label={"Orded Items"}
            >
              <TextArea value={text} rows={20} onChange={handleChange} />
            </Form.Item>
          </Form>

        </Modal  >

        <EditForm
          setIsEditModalOpen={setIsEditModalOpen}
          isEditModalOpen={isEditModalOpen}
          currentEditItem={currentEditItem}
          orderedItems={orderedItems}
          setOrderedItems={setOrderedItems}
        />


        <Col span={18} className='tableContainer' >
          <MyButton onClick={() => setIsAddItemModalOpen(true)} label={"Add Item"} type="primary" style={{ margin: "10px 10px" }}  >
            Add  Item
          </MyButton>

          <MyButton onClick={showModal} label={"Import Order"} type="primary"   style={{ margin: "10px 0px" }}  >
           
          </MyButton>


          <Table
            pagination={{ pageSize: 500 }}
            rowClassName={(item, index) => item.problematic ? 'table-row-yellow' : 'table-row-light'}
            columns={renderColumns()} dataSource={renderData()} />

        </Col>

        <Col span={24}>
          <Row gutter={16}>
            {confirmedItems.length > 0 && Array.from(Array(numberOfPerson)).map((index, i) => {

              return (
                <Col key={i} span={12}>
                  <Card title={`Person ${i + 1}`} bordered={true}>
                    <Table
                      pagination={{ pageSize: 100 }}
                      bordered={false}
                      footer={() => renderTotalForEachPerson(i)}
                      columns={renderPersonColumn(i)} dataSource={renderPersonData(i)} />
                  </Card>
                </Col>
              )
            })}
          </Row></Col>
        {combinedInfo.length > 0 && <Card size='small' title={<Title level={2}>Final Price</Title>} >{renderCombinedInfo()}</Card>}
      </Row>

    </div>
  );


}

export default App;
