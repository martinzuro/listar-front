import { useState, useReducer, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "@/components/Button";
import BaseInput from "@/components/BaseInput";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons';
// import useSWR from 'swr';

export default function List() {
  const router = useRouter();
  const [currentList, setCurrentList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [item, setItem] = useState({ name: "" });

  // const fetcher = (url) => fetch(url).then((res) => res.json())
  // const { data, error, isLoading } = useSWR(query.uuid ? `${process.env.NEXT_PUBLIC_API_URL}/lists/${router.query.uuid}` : null, fetcher)

  useEffect(() => {
    if(!router.isReady) return;
    setIsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/lists/${router.query.uuid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.message)
        } else {
          dispatch({ type: 'SET_ITEMS', items: data.data.items });
          setCurrentList(data.data);
          setIsLoading(false);
        }
      })
  }, [router.isReady, router.query.uuid])

  const [itemsFromList, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'ADD_ITEM':
        return [...state, action.item];
      case 'REMOVE_ITEM':
        return state.filter((x) => x.id !== action.id);
      case 'SET_ITEMS':
        return action.items;
      default:
        return state;
    }
  }, currentList ? currentList.items : []);

  const itemHandler = (data) => {
    setItem({ ...item, name: data.target.value });
  };

  const addItem = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lists/${currentList.uuid}/items`, {
      method: 'POST',
      body: JSON.stringify({
        name: item.name,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const newItem = {name: data.data.name, id: data.data.id};
        dispatch({ type: 'ADD_ITEM', item: newItem });
        setItem({ name: '' });
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const deleteItem = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lists/${currentList.uuid}/items/${id}`, {
      method: 'DELETE',
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        dispatch({ type: 'REMOVE_ITEM', id });
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  // if (error) return <div>Failed to load user { error.message }</div>
  if (error) return <div>Error: { error }</div>
  if (isLoading) return <p>Loading...</p>
  if (!currentList) return <p>No list</p>

  // if (!data) return null
  // return <div>{data.name}</div>

  return (
    <div className="flex flex-col items-center min-h-screen">
      <h3 className="text-2xl font-bold py-2">{currentList.title}</h3>

      <div className="">
        {
          itemsFromList.length > 0 && itemsFromList.map((item, index) => 
            <div className="flex justify-between py-1" key={index}>
              <p>{index+1}. {item.name}</p>
              <div onClick={() => deleteItem(item.id)}><FontAwesomeIcon icon={faXmark} /></div>
            </div>
          )
        }
        <div className="flex space-x-3">
          <BaseInput value={item.name} required onChange={itemHandler} />
          <Button pill disabled={item.name == ''} onClick={addItem}>
            Add
          </Button>
        </div>
      </div>

    </div>
  );
}
