'use client'
import { useState } from "react"

import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react"

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"

import { contractAddress, contractAbi } from "@/constants"

const Deposit = ({ refetch, getEvents }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [depositValue, setDepositValue] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            // Si ça a marché d'écrire dans le contrat
            onSuccess: () => {
                //Faire quelque chose ici si succès, par exemple un refetch
                // refetch();
                // getEvents();
                setDepositValue('');
                refetch();
                getEvents();
                toast({
                    title: "Le deposit a bien été réalisé.",
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

    const deposit = async() => {
        writeContract({ 
            address: contractAddress, 
            abi: contractAbi, 
            functionName: 'deposit',
            value: parseEther(depositValue),
            account: address, 
        }) 
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

    return (
        <>
            <Heading as='h2' size='xl' mt='1rem'>
                Deposit
            </Heading>
            <Flex 
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Amount in ETH' value={depositValue} onChange={(e) => setDepositValue(e.target.value)} />
                <Button colorScheme='purple' onClick={deposit}>{isPending ? 'Depositing...' : 'Deposit'} </Button>
            </Flex>
        </>
  )
}

export default Deposit