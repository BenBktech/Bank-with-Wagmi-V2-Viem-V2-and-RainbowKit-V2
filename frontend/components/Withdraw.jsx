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

const Withdraw = ({ refetch, getEvents }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [withdrawValue, setWithdrawValue] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            // Si ça a marché d'écrire dans le contrat
            onSuccess: () => {
                toast({
                    title: "La transaction du withdraw a été lancée",
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

    const withdraw = async() => {
        if(!isNaN(withdrawValue)) {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'withdraw',
                args: [parseEther(withdrawValue)],
                account: address
            })
        }
        else {
            toast({
                title: "FAUT RENTRER UN NOMBRE :@ !!! (encore ?!)",
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
            setWithdrawValue('');
            toast({
                title: "Le withdraw a bien été réalisé.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
    }, [isConfirmed])
    
    return (
       <>
            <Heading as='h2' size='xl' mt='1rem'>
                Withdraw
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
                <Input placeholder='Amount in ETH' value={withdrawValue} onChange={(e) => setWithdrawValue(e.target.value)} />
                <Button colorScheme='purple' onClick={withdraw}>Withdraw</Button>
            </Flex>
       </> 
    )
}

export default Withdraw