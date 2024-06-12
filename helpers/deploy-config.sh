#!/bin/bash

IFS=" "
suffix=""
DJINVIT_MAILTEMP_DIR="/opt/hrzoo-signup/lib64/python3.9/site-packages/invitations/templates/invitations/email"
CHOWN_USER="apache"

usage()
{
	printf "Usage: %s [argument]\n" $(basename $0) >&2
	printf "       [-s]            - suffix extension of config files that will be copied over\n" >&2
	exit 2
}

if [[ $# == 0 ]]
then
    usage
fi

while getopts 'chs:' OPTION
do
    case $OPTION in
        s)
            suffix=$OPTARG
             ;;

        h)
            usage
            ;;
        c)
            chown=1
            ;;
        ?)
            usage
            ;;
    esac
done

let ok=0
if [ ! -z "$suffix" ]
then
    echo "* deploying configs..."
    pattern="*.${suffix}"
    files=()
    while read line
    do
        files+=("$line")
    done < <(find . -maxdepth 1 -type f -name "$pattern")

    if [ ${#files[@]} -eq 0 ] || [ "${files[0]}" = "$pattern" ]
    then
        echo "No files matching pattern ${pattern} found."
    else
        for file in "${files[@]}"
        do
            echo "cp -f ${file} ${file%.${suffix}}"
            cp -f ${file} ${file%.${suffix}}
            if [ ! -z "${chown}" ]
            then
                echo "chowning ${CHOWN_USER}: ${file%.${suffix}}"
                sudo chown ${CHOWN_USER} ${file%.${suffix}}
            fi
        done
    fi

    echo -e "\n* deploying email templates..."
    pattern="email_invite_*"
    email_templates=()
    while read line
    do
        email_templates+=("$line")
    done < <(find . -maxdepth 1 -type f -name "$pattern")

    if [ ${#email_templates[@]} -eq 0 ] || [ "${email_templates[0]}" = "$pattern" ]
    then
        echo "No files matching pattern ${pattern} found."
    else
        for file in "${email_templates[@]}"
        do
            echo "cp -f ${file} ${DJINVIT_MAILTEMP_DIR}"
            cp -f ${file} ${DJINVIT_MAILTEMP_DIR}
        done
    fi
fi
