'use client'

import { useState, useEffect } from "react"

import Deposit from "./Deposit"
import Withdraw from "./Withdraw"
import Balance from "./Balance"
import Events from "./Events"

import { useAccount, useReadContract } from "wagmi"
import { formatEther, parseAbiItem } from "viem"

import { publicClient } from '../utils/client'

import { contractAddress, contractAbi } from "@/constants"

const Bank = () => {

    const { address } = useAccount()

    const [events, setEvents] = useState([])

    const { data: balanceOfConnectedAddress, error, isPending, refetch } = useReadContract({
        // adresse du contrat
        address: contractAddress,
        // abi du contrat
        abi: contractAbi,
        // nom de la fonction dans le smart contract
        functionName: 'getBalanceOfUser',
        // qui appelle la fonction ?
        account: address
    })

    const getEvents = async() => {
        // On récupère tous les events NumberChanged
        const getDepositEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event etherDeposited(address indexed account, uint amount)'),
            // du premier bloc
            fromBlock: 0n,
            // jusqu'au dernier
            toBlock: 'latest' // Pas besoin valeur par défaut
        })

        // On récupère tous les events NumberChanged
        const getWithdrawEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event etherWithdrawed(address indexed account, uint amount)'),
            // du premier bloc
            fromBlock: 0n,
            // jusqu'au dernier
            toBlock: 'latest' // Pas besoin valeur par défaut
        })

        const [depositEvents, withdrawEvents] = await Promise.all([
            getDepositEvents,
            getWithdrawEvents
        ]);
        
        // On combine les deux listes d'événements
        const combinedEvents = depositEvents.map(log => ({
            type: 'Deposit', // Ajout d'un champ pour distinguer le type d'événement
            address: log.args.account,
            amount: log.args.amount
        })).concat(withdrawEvents.map(log => ({
            type: 'Withdraw', // Ajout d'un champ pour distinguer le type d'événement
            address: log.args.account,
            amount: log.args.amount
        })));

        // Et on met ces events combinés dans le state "events"
        setEvents(combinedEvents);
    }

    // Lorsque l'on a qqn qui est connecté, on fetch les events
    useEffect(() => {
        const getAllEvents = async() => {
            if(address !== 'undefined') {
                await getEvents();
            }
        }
        getAllEvents()
    }, [address])

    return (
        <>
            <Balance isPending={isPending} balance={balanceOfConnectedAddress} />
            <Deposit refetch={refetch} getEvents={getEvents} />
            <Withdraw refetch={refetch} getEvents={getEvents} />
            <Events events={events} />
        </>
    )
}

export default Bank