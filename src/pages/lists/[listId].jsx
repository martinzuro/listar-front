import { useState, useReducer } from "react";
import { useRouter } from "next/router";
import Button from "@/components/Button";
import BaseInput from "@/components/BaseInput";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

export default function List(props) {
  const router = useRouter();
  // const [items, setItems] = useState([]);
  const [item, setItem] = useState({ name: "" });

  const [itemsInState, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'ADD_ITEM':
        return [...state, action.item];
      case 'REMOVE_ITEM':
        return state.filter((x) => x.id !== action.id);
      default:
        return state;
    }
  }, props.items ?? []);

  const itemHandler = (data) => {
    setItem({ ...item, name: data.target.value });
  };

  const addItem = async () => {
    await fetch(`http://localhost:3001/lists/${props.list.uuid}/items`, {
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
        getList(props.list.uuid);
        // setItems(...items, [{ name: item.name }]);
        const newItem = {name: data.data.name, id: data.data.id};
        dispatch({ type: 'ADD_ITEM', item: newItem });
        setItem({ name: '' });
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const deleteItem = async (id) => {
    await fetch(`http://localhost:3001/lists/${props.list.uuid}/items/${id}`, {
      method: 'DELETE',
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        getList(props.list.uuid);
        dispatch({ type: 'REMOVE_ITEM', id });
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  if (props.hasError) {
    return <h1>List not found</h1>;
  }

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  return (
    <div class="flex flex-col items-center min-h-screen">
      <h3 class="text-2xl font-bold py-2">{props.list.title}</h3>

      <div class="">
        {
          itemsInState.length > 0 && itemsInState.map((item, index) => 
            <div class="flex justify-between py-1" key={index}>
              <p>{index+1}. {item.name}</p>
              <div onClick={() => deleteItem(item.id)}><FontAwesomeIcon icon={faXmark} /></div>
            </div>
          )
        }
        <div class="flex space-x-3">
          <BaseInput value={item.name} required onChange={itemHandler} />
          <Button pill disabled={item.name == ''} onClick={addItem}>
            Add
          </Button>
        </div>
      </div>

    </div>
  );
}

export async function getStaticPaths() {
  const lists = await getLists();

  return {
    paths: lists.map((list) => {
      return {
        params: {
          listId: list.uuid.toString(),
        },
      };
    }),
    // fallback: false,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const list = await getList(params.listId);

  if (!list) {
    return {
      props: { hasError: true },
    };
  }

  return {
    props: list,
  };
}

const getList = async (uuid) => {
  return fetch(`http://localhost:3001/lists/${uuid}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        return [];
      }
      return data.data;
    });
};

const getLists = async () => {
  return fetch(`http://localhost:3001/lists/`)
    .then((response) => response.json())
    .then((data) => {
      return data.data;
    });
};
