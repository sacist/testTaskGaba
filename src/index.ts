import 'dotenv/config'
import app from './app'


const PORT=process.env.PORT

const start=()=>{
    app.listen(PORT,()=>{
        console.log(`Сервер успешно запущен на порту ${PORT}`);
    })
}

start()