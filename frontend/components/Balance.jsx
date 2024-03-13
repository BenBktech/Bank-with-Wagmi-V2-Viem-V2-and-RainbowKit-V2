import { Spinner, Text } from "@chakra-ui/react"

import { formatEther } from "viem"

const Balance = ({ isPending, balance }) => {
    return (
        <>
            {isPending ? (
                <Spinner />
            ) : (
                <Text>Your balance is : <Text as='b'>{formatEther(balance.toString())} ETH</Text></Text>
            )}
        </>
    )
}

export default Balance