'use client';
import { useState, useEffect } from "react";

import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react";
import {
    Alert,
    AlertIcon,
} from '@chakra-ui/react'

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

import { parseEther } from "viem";

import { contractAddress, contractAbi } from "@/constants";

const Deposit = ({ refetch, getEvents }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [depositValue, setDepositValue] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            // Si ça a marché d'écrire dans le contrat
            onSuccess: () => {
                toast({
                    title: "La transaction du deposit a été lancée",
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
        }
    }) 

    const deposit = async() => {
        if(!isNaN(depositValue)) {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'deposit',
                value: parseEther(depositValue),
                account: address
            })
        }
        else {
            toast({
                title: "FAUT RENTRER UN NOMBRE :@ !!!",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

    useEffect(() => {
        if(isConfirmed) {
            // refetch la balance
            refetch()
            // refetch les events
            getEvents();
            setDepositValue('');
            toast({
                title: "Le deposit a bien été réalisé.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
    }, [isConfirmed])
    
    return (
       <>
            <Heading as='h2' size='xl' mt='1rem'>
                Deposit
            </Heading>
            {isConfirmed 
            &&  <Alert mt="1rem" status='success'>
                    <AlertIcon />
                    Your transaction has been confirmed
                </Alert>}
            <Flex 
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Amount in ETH' value={depositValue} onChange={(e) => setDepositValue(e.target.value)} />
                <Button colorScheme='purple' onClick={deposit}>Deposit</Button>
            </Flex>
       </> 
    )
}

export default Deposit