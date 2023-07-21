import { Button, ConfigProvider } from 'antd'
import React from 'react'

export default function MyButton({ label , style,onClick, disabled}) {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#7dc242',
                },
            }}
        >
            <Button disabled={disabled} style={style} onClick={onClick} type='primary' >{label}</Button>
        </ConfigProvider>
    )
}
