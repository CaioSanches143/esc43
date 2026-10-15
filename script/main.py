from sql_load import *


def main():
  
    list_escoteiros =   load_escoteiros("sql/adm_esc.db")
    print("Escoteiros:")
    for escoteiro in list_escoteiros:
        print(escoteiro)



    list_itens =   load_itens("sql/adm_esc.db")
    print("Itens:")
    for item in list_itens:
        print(item)


if __name__ == "__main__":
    main()