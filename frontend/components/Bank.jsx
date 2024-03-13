import { useState, useEffect } from 'react'

import Deposit from './Deposit'
import Withdraw from './Withdraw'
import Balance from './Balance'
import Events from './Events'

import { useAccount, useReadContract } from 'wagmi'
import { contractAbi, contractAddress } from '@/constants'

import { publicClient } from '@/utils/client'

import { parseAbiItem } from 'viem'

const Bank = () => {

  const { address } = useAccount();
  const [events, setEvents] = useState([])

  // On récupère la balance ici
  const { data: balanceOfConnectedAddress, error, isPending, refetch } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getBalanceOfUser',
    account: address
  })

  const getEvents = async() => {
    const depositEvents = await publicClient.getLogs({
      address: contractAddress,
      event: parseAbiItem('event etherDeposited(address indexed account, uint amount)'),
      // du premier bloc
      fromBlock: 0n,
      // jusqu'au dernier
      toBlock: 'latest' // Pas besoin valeur par défaut
    })

    const withdrawEvents = await publicClient.getLogs({
      address: contractAddress,
      event: parseAbiItem('event etherWithdrawed(address indexed account, uint amount)'),
      // du premier bloc
      fromBlock: 0n,
      // jusqu'au dernier
      toBlock: 'latest' // Pas besoin valeur par défaut
    })

    const combinedEvents = depositEvents.map((event) => ({
      type: 'Deposit',
      address: event.args.account,
      amount: event.args.amount,
      blockNumber: Number(event.blockNumber)
    })).concat(withdrawEvents.map((event) => ({
      type: 'Withdraw',
      address: event.args.account,
      amount: event.args.amount,
      blockNumber: Number(event.blockNumber)
    })))

    // sort by value
    combinedEvents.sort(function (a, b) {
      return b.blockNumber - a.blockNumber;
    });

    setEvents(combinedEvents)
  }

  useEffect(() => {
    const getAllEvents = async() => {
      if(address !== 'undefined') {
        await getEvents();
      }
    }
    getAllEvents();
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