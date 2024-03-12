'use client'

import { useState } from "react"

import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react"

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"

import { contractAddress, contractAbi } from "@/constants"

const Withdraw = ({ refetch, getEvents }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [withdrawValue, setWithdrawValue] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            // Si ça a marché d'écrire dans le contrat
            onSuccess: () => {
                //Faire quelque chose ici si succès, par exemple un refetch
                // refetch();
                // getEvents();
                setWithdrawValue('');
                refetch();
                getEvents();
                toast({
                    title: "Le Withdraw a bien été réalisé.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            },
            // Si erreur
            onError: (error) => {
                toast({
                    title: error.shortMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            },
        },
    })

    const withdraw = async() => {
        writeContract({ 
            address: contractAddress, 
            abi: contractAbi, 
            functionName: 'withdraw',
            args: [parseEther(withdrawValue)],
            account: address, 
        }) 
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

    return (
        <>
            <Heading as='h2' size='xl' mt='2rem'>
                Withdraw
            </Heading>
            <Flex 
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Amount in ETH' value={withdrawValue} onChange={(e) => setWithdrawValue(e.target.value)} />
                <Button colorScheme='purple' onClick={withdraw}>{isPending ? 'Withdrawing...' : 'Withdraw'} </Button>
            </Flex>
        </>
  )
}

export default Withdraw