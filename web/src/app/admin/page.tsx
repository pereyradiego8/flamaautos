import type {Metadata} from 'next';
import AdminConsole from '@/components/AdminConsole';
export const metadata:Metadata={title:'Administración | Flama Autos',robots:{index:false,follow:false}};
export default function Admin(){return <main className="section admin-page"><p className="eyebrow">GESTIÓN PRIVADA</p><h1>Panel administrativo</h1><AdminConsole/></main>}
